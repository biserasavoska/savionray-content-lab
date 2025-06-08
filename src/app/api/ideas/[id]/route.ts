import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { isCreative, isAdmin, isClient } from '@/lib/auth'

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
        contentDrafts: {
          select: {
            id: true,
            status: true,
            updatedAt: true,
          },
        },
      },
    })

    if (!idea) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 })
    }

    // Check if user has access to this idea
    if (isCreative(session) && idea.createdById !== session.user.id) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    return NextResponse.json(idea)
  } catch (error) {
    console.error('Failed to fetch idea:', error)
    return NextResponse.json({ error: 'Failed to fetch idea' }, { status: 500 })
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
    const idea = await prisma.idea.findUnique({
      where: { id: params.id },
    })

    if (!idea) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 })
    }

    // Only creator or admin can update the idea content
    if (!isAdmin(session) && idea.createdById !== session.user.id) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const { title, description } = await req.json()

    const updatedIdea = await prisma.idea.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
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
    return NextResponse.json({ error: 'Failed to update idea' }, { status: 500 })
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

    // Only creator or admin can delete the idea
    if (!isAdmin(session) && idea.createdById !== session.user.id) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    await prisma.idea.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete idea:', error)
    return NextResponse.json({ error: 'Failed to delete idea' }, { status: 500 })
  }
} 