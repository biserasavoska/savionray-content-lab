import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { isClient, isAdmin } from '@/lib/auth'
import { DRAFT_STATUS, CONTENT_TYPE, IDEA_STATUS } from '@/lib/utils/enum-constants'
import { requireOrganizationContext, validateOrganizationAccess } from '@/lib/utils/organization-context'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get organization context and validate access
    const orgContext = await requireOrganizationContext()
    const hasAccess = await validateOrganizationAccess(params.id, 'idea', orgContext.organizationId)
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'Idea not found or access denied' }, { status: 404 })
    }

    const idea = await prisma.idea.findUnique({
      where: { id: params.id },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
        comments: {
          include: {
            createdBy: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        contentDrafts: {
          include: {
            createdBy: {
              select: {
                name: true,
                email: true,
              },
            },
            feedbacks: {
              include: {
                createdBy: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    if (!idea) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 })
    }

    return NextResponse.json(idea)
  } catch (error) {
    console.error('Failed to fetch idea:', error)
    return NextResponse.json(
      { error: 'Failed to fetch idea' },
      { status: 500 }
    )
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
    // Get organization context and validate access
    const orgContext = await requireOrganizationContext()
    const hasAccess = await validateOrganizationAccess(params.id, 'idea', orgContext.organizationId)
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'Idea not found or access denied' }, { status: 404 })
    }

    const { status, ...updateData } = await req.json()

    // Check if the idea exists
    const idea = await prisma.idea.findUnique({
      where: { id: params.id },
      include: {
        createdBy: {
          select: {
            email: true,
          },
        },
      },
    })

    if (!idea) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 })
    }

    // Only allow status updates by clients or admins
    if (status && !isClient(session) && !isAdmin(session)) {
      return NextResponse.json(
        { error: 'Only clients can update idea status' },
        { status: 403 }
      )
    }

    // Only allow content updates by creators or admins
    if (
      Object.keys(updateData).length > 0 &&
      session.user.id !== idea.createdById &&
      !isAdmin(session)
    ) {
      return NextResponse.json(
        { error: 'Only creators can update idea content' },
        { status: 403 }
      )
    }

    // Use a transaction to update the idea and potentially create a content draft
    const result = await prisma.$transaction(async (tx: any) => {
      const updatedIdea = await tx.idea.update({
        where: { id: params.id },
        data: {
          ...(status && { status: status as any }),
          ...updateData,
        },
        include: {
          createdBy: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      })

      // If the idea was just approved and there are no existing content drafts, create one
      if (status === IDEA_STATUS.APPROVED && idea.status !== IDEA_STATUS.APPROVED) {
        const existingDrafts = await tx.contentDraft.findMany({
          where: { ideaId: params.id }
        })

        if (existingDrafts.length === 0) {
          // Create an initial content draft for the approved idea
          await tx.contentDraft.create({
            data: {
              ideaId: params.id,
              status: DRAFT_STATUS.DRAFT,
              contentType: idea.contentType || CONTENT_TYPE.SOCIAL_MEDIA_POST,
              body: `Content draft for: ${idea.title}\n\n${idea.description}`,
              createdById: idea.createdById, // Use the idea creator as the content creator
              organizationId: orgContext.organizationId, // Add organization isolation
              metadata: {
                autoGenerated: true,
                ideaTitle: idea.title,
                ideaDescription: idea.description,
                contentType: idea.contentType || CONTENT_TYPE.SOCIAL_MEDIA_POST
              }
            }
          })
        }
      }

      return updatedIdea
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to update idea:', error)
    return NextResponse.json(
      { error: 'Failed to update idea' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const idea = await prisma.idea.findUnique({
      where: { id: params.id },
    })

    if (!idea) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 })
    }

    // Only allow deletion by creators or admins
    if (session.user.id !== idea.createdById && !isAdmin(session)) {
      return NextResponse.json(
        { error: 'Only creators can delete ideas' },
        { status: 403 }
      )
    }

    await prisma.idea.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete idea:', error)
    return NextResponse.json(
      { error: 'Failed to delete idea' },
      { status: 500 }
    )
  }
} 