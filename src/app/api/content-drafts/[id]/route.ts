import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DraftStatus } from '@prisma/client'
import { isCreative, isAdmin } from '@/lib/auth'

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

    // Check permissions - only creator, admin, or client can view
    if (!isAdmin(session) && contentDraft.createdById !== session.user.id) {
      // For clients, they can view content drafts for ideas they created
      const idea = await prisma.idea.findUnique({
        where: { id: contentDraft.ideaId },
        select: { createdById: true }
      })
      
      if (!idea || idea.createdById !== session.user.id) {
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