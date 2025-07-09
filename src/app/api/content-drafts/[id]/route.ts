import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DraftStatus } from '@prisma/client'
import { isCreative, isAdmin, isClient } from '@/lib/auth'
import { getOrganizationContext } from '@/lib/utils/organization-context'

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
      select: { createdById: true }
    })

    if (!contentDraft) {
      return NextResponse.json({ error: 'Content draft not found' }, { status: 404 })
    }

    // Only creator or admin can update
    if (!isAdmin(session) && contentDraft.createdById !== session.user.id) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const updateData: any = {}
    if (body !== undefined) updateData.body = body
    if (status !== undefined) updateData.status = status

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

    return NextResponse.json(updatedDraft)
  } catch (error) {
    console.error('Failed to update content draft:', error)
    return NextResponse.json({ error: 'Failed to update content draft' }, { status: 500 })
  }
} 