import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { DraftStatus } from '@prisma/client'

import { authOptions , isCreative, isAdmin, isClient } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getOrganizationContext } from '@/lib/utils/organization-context'
import { logger } from '@/lib/utils/logger'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const contentDraft = await prisma.contentDraft.findUnique({
      where: { id: params.id },
      include: {
        idea: {
          include: {
            createdBy: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        createdBy: {
          select: {
            name: true,
            email: true
          }
        },
        media: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        feedbacks: {
          include: {
            createdBy: {
              select: {
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!contentDraft) {
      return NextResponse.json({ error: 'Content draft not found' }, { status: 404 })
    }

    // Check permissions - only creator, admin, or client from same organization can view
    if (!isAdmin(session) && contentDraft.createdById !== session.user.id) {
      // For clients, they can view content drafts from their organization
      if (isClient(session)) {
        const orgContext = await getOrganizationContext()
        if (contentDraft.organizationId !== orgContext?.organizationId) {
          return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
        }
      } else {
        // For creatives, they can only view their own drafts
        return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
      }
    }

    return NextResponse.json(contentDraft)
  } catch (error) {
    console.error('Failed to fetch content draft:', error)
    return NextResponse.json({ error: 'Failed to fetch content draft' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { body, status } = await req.json()

    const contentDraft = await prisma.contentDraft.findUnique({
      where: { id: params.id },
      select: { 
        createdById: true,
        organizationId: true,
        status: true
      }
    })

    if (!contentDraft) {
      return NextResponse.json({ error: 'Content draft not found' }, { status: 404 })
    }

    // Log the update attempt for debugging
    logger.info('Content draft update attempt', {
      userId: session.user.id,
      userEmail: session.user.email,
      userRole: session.user.role,
      draftId: params.id,
      currentStatus: contentDraft.status,
      newStatus: status,
      isAdmin: isAdmin(session),
      isClient: isClient(session),
      isCreator: contentDraft.createdById === session.user.id
    })

    // Check permissions
    let canUpdate = false
    let updateReason = ''

    if (isAdmin(session)) {
      // Admins can update anything
      canUpdate = true
      updateReason = 'admin_permission'
    } else if (contentDraft.createdById === session.user.id) {
      // Creator can update their own drafts
      canUpdate = true
      updateReason = 'creator_permission'
    } else if (isClient(session) && status === 'APPROVED') {
      // Clients can approve drafts for their organization
      const orgContext = await getOrganizationContext()
      if (orgContext && contentDraft.organizationId === orgContext.organizationId) {
        canUpdate = true
        updateReason = 'client_approval_permission'
      } else {
        logger.warn('Client approval denied - organization mismatch', {
          clientOrgId: orgContext?.organizationId,
          draftOrgId: contentDraft.organizationId
        })
      }
    }

    if (!canUpdate) {
      logger.warn('Content draft update denied', {
        userId: session.user.id,
        userEmail: session.user.email,
        userRole: session.user.role,
        draftId: params.id,
        reason: 'insufficient_permissions'
      })
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Validate status transition for clients
    if (isClient(session) && status === 'APPROVED') {
      // Clients can only approve drafts that are in AWAITING_FEEDBACK status
      if (contentDraft.status !== 'AWAITING_FEEDBACK') {
        logger.warn('Client approval denied - invalid status transition', {
          userId: session.user.id,
          currentStatus: contentDraft.status,
          attemptedStatus: status
        })
        return NextResponse.json({ 
          error: 'Can only approve content that is awaiting feedback' 
        }, { status: 400 })
      }
    }

    const updateData: any = {}
    if (body !== undefined) updateData.body = body
    if (status !== undefined) updateData.status = status

    logger.info('Updating content draft', {
      userId: session.user.id,
      draftId: params.id,
      updateReason,
      newStatus: status
    })

    const updatedDraft = await prisma.contentDraft.update({
      where: { id: params.id },
      data: updateData,
      include: {
        idea: {
          include: {
            createdBy: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        createdBy: {
          select: {
            name: true,
            email: true
          }
        },
        media: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        feedbacks: {
          include: {
            createdBy: {
              select: {
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    logger.info('Content draft updated successfully', {
      userId: session.user.id,
      draftId: params.id,
      newStatus: updatedDraft.status
    })

    return NextResponse.json(updatedDraft)
  } catch (error) {
    logger.error('Failed to update content draft', error instanceof Error ? error : new Error(String(error)), {
      userId: session.user.id,
      draftId: params.id
    })
    return NextResponse.json({ error: 'Failed to update content draft' }, { status: 500 })
  }
} 