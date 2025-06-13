import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { DraftStatus } from '@prisma/client'
import { isClient } from '@/lib/auth'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; draftId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isClient(session)) {
    return NextResponse.json({ error: 'Only clients can update draft status' }, { status: 403 })
  }

  try {
    const { status } = await req.json()

    // Verify the draft exists and belongs to the idea
    const draft = await prisma.contentDraft.findFirst({
      where: {
        id: params.draftId,
        ideaId: params.id,
      },
    })

    if (!draft) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 })
    }

    // Validate status transitions
    if (draft.status === DraftStatus.PENDING_FIRST_REVIEW) {
      if (status !== DraftStatus.APPROVED_FOR_PUBLISHING && status !== DraftStatus.NEEDS_REVISION) {
        return NextResponse.json(
          { error: 'Invalid status transition from PENDING_FIRST_REVIEW' },
          { status: 400 }
        )
      }
    } else if (draft.status === DraftStatus.PENDING_FINAL_APPROVAL) {
      if (status !== DraftStatus.APPROVED_FOR_PUBLISHING && status !== DraftStatus.REJECTED) {
        return NextResponse.json(
          { error: 'Invalid status transition from PENDING_FINAL_APPROVAL' },
          { status: 400 }
        )
      }
    } else {
      return NextResponse.json(
        { error: 'Cannot update status in current state' },
        { status: 400 }
      )
    }

    // Update the draft status
    const updatedDraft = await prisma.contentDraft.update({
      where: { id: params.draftId },
      data: { status },
    })

    return NextResponse.json(updatedDraft)
  } catch (error) {
    console.error('Error updating draft status:', error)
    return NextResponse.json(
      { error: 'Failed to update draft status' },
      { status: 500 }
    )
  }
} 