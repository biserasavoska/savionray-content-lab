import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's organization ID
    const userOrg = await prisma.organizationUser.findFirst({
      where: {
        userId: session.user.id,
        isActive: true
      },
      select: {
        organizationId: true
      }
    })

    if (!userOrg) {
      return NextResponse.json({ error: 'No active organization found' }, { status: 400 })
    }

    // Get all knowledge bases for the organization
    const knowledgeBases = await prisma.knowledgeBase.findMany({
      where: {
        organizationId: userOrg.organizationId
      },
      include: {
        documents: {
          select: {
            id: true,
            filename: true,
            originalName: true,
            status: true,
            createdAt: true,
            _count: {
              select: {
                chunks: true
              }
            }
          }
        },
        _count: {
          select: {
            documents: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ knowledgeBases })
  } catch (error) {
    console.error('Error fetching knowledge bases:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, description, isPublic = false } = await req.json()

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Get user's organization ID
    const userOrg = await prisma.organizationUser.findFirst({
      where: {
        userId: session.user.id,
        isActive: true
      },
      select: {
        organizationId: true
      }
    })

    if (!userOrg) {
      return NextResponse.json({ error: 'No active organization found' }, { status: 400 })
    }

    // Create knowledge base
    const knowledgeBase = await prisma.knowledgeBase.create({
      data: {
        name,
        description,
        isPublic,
        organizationId: userOrg.organizationId,
        createdById: session.user.id
      },
      include: {
        documents: {
          select: {
            id: true,
            filename: true,
            originalName: true,
            status: true,
            createdAt: true,
            _count: {
              select: {
                chunks: true
              }
            }
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
    console.error('Error creating knowledge base:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
