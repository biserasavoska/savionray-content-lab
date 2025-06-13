import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { isClient, isAdmin } from '@/lib/auth'
import { IdeaStatus } from '@prisma/client'

export async function GET(
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

    const updatedIdea = await prisma.idea.update({
      where: { id: params.id },
      data: {
        ...(status && { status: status as IdeaStatus }),
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

    return NextResponse.json(updatedIdea)
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