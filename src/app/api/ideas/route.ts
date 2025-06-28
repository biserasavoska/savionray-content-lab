import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { isCreative, isAdmin, isClient } from '@/lib/auth'
import { Prisma, IdeaStatus } from '@prisma/client'
import { IDEA_STATUS, isValidIdeaStatus } from '@/lib/utils/enum-constants'

// Force fresh build - staging deployment fix
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isCreative(session) && !isAdmin(session)) {
    return NextResponse.json({ error: 'Only creatives and admins can create ideas' }, { status: 403 })
  }

  try {
    const { title, description, publishingDateTime, savedForLater, mediaType, contentType } = await req.json()

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 })
    }

    if (!contentType) {
      return NextResponse.json({ error: 'Content type is required' }, { status: 400 })
    }

    const idea = await prisma.idea.create({
      data: {
        title,
        description,
        publishingDateTime: publishingDateTime ? new Date(publishingDateTime) : null,
        savedForLater: savedForLater || false,
        mediaType: mediaType || null,
        contentType,
        createdById: session.user.id,
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

    return NextResponse.json(idea)
  } catch (error) {
    console.error('Failed to create idea:', error)
    return NextResponse.json({ error: 'Failed to create idea' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const url = new URL(req.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const skip = (page - 1) * limit
    const status = url.searchParams.get('status')

    // Use centralized enum constants instead of hardcoded strings
    const statusFilter = status && isValidIdeaStatus(status) ? { status: { equals: status } } : undefined;

    const totalCount = await prisma.idea.count({
      where: statusFilter,
    })

    const ideas = await prisma.idea.findMany({
      where: statusFilter,
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
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
        },
      },
    })

    return NextResponse.json({
      ideas,
      pagination: {
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        current: page,
        limit,
      },
    })
  } catch (error) {
    console.error('Failed to fetch ideas:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ideas' },
      { status: 500 }
    )
  }
} 