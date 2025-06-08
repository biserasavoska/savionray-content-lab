import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { isAdmin, isClient } from '@/lib/auth'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Only admins and clients can approve drafts
  if (!isAdmin(session) && !isClient(session)) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
  }

  try {
    const { scheduledDate } = await req.json()

    // Check if the draft exists and is in the correct status
    const draft = await prisma.contentDraft.findUnique({
      where: { id: params.id },
      include: {
        idea: true,
      },
    })

    if (!draft) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 })
    }

    if (draft.status === 'APPROVED') {
      return NextResponse.json({ error: 'Draft is already approved' }, { status: 400 })
    }

    // Start a transaction to update draft and create scheduled post
    const result = await prisma.$transaction(async (tx) => {
      // Update draft status
      const updatedDraft = await tx.contentDraft.update({
        where: { id: params.id },
        data: {
          status: 'APPROVED',
        },
      })

      // Create scheduled post if date is provided
      if (scheduledDate) {
        const scheduledPost = await tx.scheduledPost.create({
          data: {
            scheduledDate: new Date(scheduledDate),
            contentDraftId: draft.id,
            status: 'SCHEDULED',
            metadata: draft.metadata,
          },
        })

        return { draft: updatedDraft, scheduledPost }
      }

      return { draft: updatedDraft }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to approve draft:', error)
    return NextResponse.json(
      { error: 'Failed to approve draft' },
      { status: 500 }
    )
  }
} 