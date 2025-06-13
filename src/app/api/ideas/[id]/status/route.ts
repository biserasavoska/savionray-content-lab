import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { IdeaStatus } from '@prisma/client'
import { isClient } from '@/lib/auth'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isClient(session)) {
    return NextResponse.json({ error: 'Only clients can update idea status' }, { status: 403 })
  }

  try {
    const { status } = await req.json()

    // Verify the idea exists
    const idea = await prisma.idea.findUnique({
      where: { id: params.id },
    })

    if (!idea) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 })
    }

    // Validate status transitions
    if (idea.status === IdeaStatus.PENDING_CLIENT_APPROVAL) {
      if (status !== IdeaStatus.APPROVED_BY_CLIENT && status !== IdeaStatus.REJECTED_BY_CLIENT) {
        return NextResponse.json(
          { error: 'Invalid status transition from PENDING_CLIENT_APPROVAL' },
          { status: 400 }
        )
      }
    } else {
      return NextResponse.json(
        { error: 'Cannot update status in current state' },
        { status: 400 }
      )
    }

    // Update the idea status
    const updatedIdea = await prisma.idea.update({
      where: { id: params.id },
      data: { status },
    })

    return NextResponse.json(updatedIdea)
  } catch (error) {
    console.error('Error updating idea status:', error)
    return NextResponse.json(
      { error: 'Failed to update idea status' },
      { status: 500 }
    )
  }
} 