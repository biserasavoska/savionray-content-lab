import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { isClient } from '@/lib/auth'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isClient(session)) {
    return NextResponse.json({ error: 'Only clients can save ideas for later' }, { status: 403 })
  }

  try {
    // Check if idea exists
    const idea = await prisma.idea.findUnique({
      where: { id: params.id },
    })

    if (!idea) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 })
    }

    // Update the idea
    const updatedIdea = await prisma.idea.update({
      where: { id: params.id },
      data: {
        savedForLater: true,
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
    console.error('Failed to save idea for later:', error)
    return NextResponse.json({ error: 'Failed to save idea for later' }, { status: 500 })
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

  if (!isClient(session)) {
    return NextResponse.json({ error: 'Only clients can unsave ideas' }, { status: 403 })
  }

  try {
    // Check if idea exists
    const idea = await prisma.idea.findUnique({
      where: { id: params.id },
    })

    if (!idea) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 })
    }

    // Update the idea
    const updatedIdea = await prisma.idea.update({
      where: { id: params.id },
      data: {
        savedForLater: false,
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
    console.error('Failed to unsave idea:', error)
    return NextResponse.json({ error: 'Failed to unsave idea' }, { status: 500 })
  }
} 