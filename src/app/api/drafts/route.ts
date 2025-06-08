import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { isCreative, isAdmin } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isCreative(session) && !isAdmin(session)) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
  }

  try {
    const { body, ideaId, contentType } = await req.json()

    if (!body || !ideaId) {
      return NextResponse.json(
        { error: 'Content body and idea ID are required' },
        { status: 400 }
      )
    }

    // Check if the idea exists and user has access
    const idea = await prisma.idea.findUnique({
      where: { id: ideaId },
    })

    if (!idea) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 })
    }

    if (!isAdmin(session) && idea.createdById !== session.user.id) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const draft = await prisma.contentDraft.create({
      data: {
        body,
        ideaId,
        createdById: session.user.id,
        metadata: {
          contentType,
        },
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

    return NextResponse.json(draft)
  } catch (error) {
    console.error('Failed to create draft:', error)
    return NextResponse.json(
      { error: 'Failed to create draft' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const ideaId = searchParams.get('ideaId')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const skip = (page - 1) * limit

  try {
    const where = {
      ...(ideaId ? { ideaId } : {}),
      ...(isCreative(session) ? { createdById: session.user.id } : {}),
    }

    const [drafts, total] = await Promise.all([
      prisma.contentDraft.findMany({
        where,
        include: {
          createdBy: {
            select: {
              name: true,
              email: true,
            },
          },
          idea: {
            select: {
              title: true,
              status: true,
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.contentDraft.count({ where }),
    ])

    return NextResponse.json({
      drafts,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    })
  } catch (error) {
    console.error('Failed to fetch drafts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch drafts' },
      { status: 500 }
    )
  }
} 