import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { isCreative, isAdmin } from '@/lib/auth'
import { ContentType } from '@prisma/client'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isCreative(session) && !isAdmin(session)) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
  }

  try {
    const { body, contentType } = await req.json()

    // Check if idea exists
    const idea = await prisma.idea.findUnique({
      where: { id: params.id },
    })

    if (!idea) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 })
    }

    // Create a new draft
    const draft = await prisma.contentDraft.create({
      data: {
        body: body || '',
        contentType: contentType as ContentType || ContentType.BLOG_POST,
        idea: {
          connect: { id: params.id },
        },
        createdBy: {
          connect: { id: session.user.id },
        },
      },
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

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const drafts = await prisma.contentDraft.findMany({
      where: {
        ideaId: params.id,
      },
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
    })

    return NextResponse.json(drafts)
  } catch (error) {
    console.error('Failed to fetch drafts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch drafts' },
      { status: 500 }
    )
  }
} 