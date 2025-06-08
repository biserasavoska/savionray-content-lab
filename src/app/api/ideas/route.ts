import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { isCreative, isAdmin, isClient } from '@/lib/auth'
import { Prisma } from '@prisma/client'

type IdeaStatus = 'PENDING' | 'APPROVED_BY_CLIENT' | 'REJECTED_BY_CLIENT'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isCreative(session) && !isAdmin(session)) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
  }

  try {
    const { title, description } = await req.json()

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 })
    }

    const idea = await prisma.idea.create({
      data: {
        title,
        description,
        createdById: session.user.id,
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

  const { searchParams } = new URL(req.url)
  const statusParam = searchParams.get('status')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const skip = (page - 1) * limit

  try {
    const where = {
      ...(statusParam && ['PENDING', 'APPROVED_BY_CLIENT', 'REJECTED_BY_CLIENT'].includes(statusParam as IdeaStatus)
        ? { status: statusParam as IdeaStatus }
        : {}),
      ...(isCreative(session) ? { createdById: session.user.id } : {}),
    }

    const [ideas, total] = await Promise.all([
      prisma.idea.findMany({
        where,
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
        skip,
        take: limit,
      }),
      prisma.idea.count({ where }),
    ])

    return NextResponse.json({
      ideas,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    })
  } catch (error) {
    console.error('Failed to fetch ideas:', error)
    return NextResponse.json({ error: 'Failed to fetch ideas' }, { status: 500 })
  }
} 