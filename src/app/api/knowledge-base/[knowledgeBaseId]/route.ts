import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: {
    knowledgeBaseId: string
  }
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const knowledgeBaseId = params.knowledgeBaseId

    // Get knowledge base with documents and chunks
    const knowledgeBase = await prisma.knowledgeBase.findFirst({
      where: {
        id: knowledgeBaseId,
        organizationId: {
          in: await prisma.organizationUser.findMany({
            where: { userId: session.user.id, isActive: true },
            select: { organizationId: true }
          }).then(orgs => orgs.map(org => org.organizationId))
        }
      },
      include: {
        documents: {
          include: {
            _count: {
              select: {
                chunks: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            documents: true
          }
        }
      }
    })

    if (!knowledgeBase) {
      return NextResponse.json({ error: 'Knowledge base not found' }, { status: 404 })
    }

    return NextResponse.json({ knowledgeBase })
  } catch (error) {
    console.error('Error fetching knowledge base:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const knowledgeBaseId = params.knowledgeBaseId
    const { name, description, isPublic } = await req.json()

    // Verify ownership
    const existingKnowledgeBase = await prisma.knowledgeBase.findFirst({
      where: {
        id: knowledgeBaseId,
        organizationId: {
          in: await prisma.organizationUser.findMany({
            where: { userId: session.user.id, isActive: true },
            select: { organizationId: true }
          }).then(orgs => orgs.map(org => org.organizationId))
        }
      }
    })

    if (!existingKnowledgeBase) {
      return NextResponse.json({ error: 'Knowledge base not found' }, { status: 404 })
    }

    // Update knowledge base
    const knowledgeBase = await prisma.knowledgeBase.update({
      where: { id: knowledgeBaseId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(isPublic !== undefined && { isPublic }),
        updatedAt: new Date()
      },
      include: {
        documents: {
          include: {
            _count: {
              select: {
                chunks: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            documents: true
          }
        }
      }
    })

    return NextResponse.json({ knowledgeBase })
  } catch (error) {
    console.error('Error updating knowledge base:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const knowledgeBaseId = params.knowledgeBaseId

    // Verify ownership
    const knowledgeBase = await prisma.knowledgeBase.findFirst({
      where: {
        id: knowledgeBaseId,
        organizationId: {
          in: await prisma.organizationUser.findMany({
            where: { userId: session.user.id, isActive: true },
            select: { organizationId: true }
          }).then(orgs => orgs.map(org => org.organizationId))
        }
      }
    })

    if (!knowledgeBase) {
      return NextResponse.json({ error: 'Knowledge base not found' }, { status: 404 })
    }

    // Delete knowledge base (documents and chunks will be cascade deleted)
    await prisma.knowledgeBase.delete({
      where: { id: knowledgeBaseId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting knowledge base:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
