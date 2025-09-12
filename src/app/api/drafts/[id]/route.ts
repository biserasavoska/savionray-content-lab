import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getOrganizationContext } from '@/lib/utils/organization-context'

// GET /api/drafts/[id] - Fetch a specific content draft
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get organization context - pass the actual request object
    const orgContext = await getOrganizationContext(undefined, request)
    
    console.log('API Debug - Organization context:', orgContext)
    console.log('API Debug - Request headers:', Object.fromEntries(request.headers.entries()))
    
    if (!orgContext) {
      console.error('Organization context failed for user:', session.user.email)
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Fetch the content draft
    const contentDraft = await prisma.contentDraft.findUnique({
      where: {
        id: params.id,
        organizationId: orgContext.organizationId
      },
      include: {
        Idea: {
          include: {
            User: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                image: true
              }
            }
          }
        },
        User: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            image: true
          }
        },
        Feedback: {
          include: {
            User: {
              select: {
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        Media: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!contentDraft) {
      return NextResponse.json({ error: 'Content draft not found' }, { status: 404 })
    }

    // Debug: Log the content draft data to understand what's being returned
    console.log('Content draft found:', {
      id: contentDraft.id,
      ideaId: contentDraft.ideaId,
      hasIdea: !!contentDraft.Idea,
      ideaTitle: contentDraft.Idea?.title,
      ideaDescription: contentDraft.Idea?.description
    })

    return NextResponse.json(contentDraft)
  } catch (error) {
    console.error('Error fetching content draft:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/drafts/[id] - Update a content draft
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get organization context
    const orgContext = await getOrganizationContext(undefined, request)
    
    if (!orgContext) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    const body = await request.json()
    const { status, body: contentBody } = body

    // Update the content draft
    const updatedDraft = await prisma.contentDraft.update({
      where: {
        id: params.id,
        organizationId: orgContext.organizationId
      },
      data: {
        ...(status && { status }),
        ...(contentBody && { body: contentBody }),
        updatedAt: new Date()
      }
    })

    return NextResponse.json(updatedDraft)
  } catch (error) {
    console.error('Error updating content draft:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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
    const draft = await prisma.contentDraft.findUnique({
      where: { id: params.id },
    })

    if (!draft) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 })
    }

    // Only the creator or admin can delete the draft
    if (draft.createdById !== session.user.id) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    await prisma.contentDraft.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete draft:', error)
    return NextResponse.json(
      { error: 'Failed to delete draft' },
      { status: 500 }
    )
  }
} 