import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { isClient, isAdmin } from '@/lib/auth'
import { DraftStatus } from '@prisma/client'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isClient(session) && !isAdmin(session)) {
    return NextResponse.json({ error: 'Only clients and admins can reject drafts' }, { status: 403 })
  }

  try {
    const { feedback } = await req.json()

    if (!feedback) {
      return NextResponse.json(
        { error: 'Feedback is required when rejecting a draft' },
        { status: 400 }
      )
    }

    const draft = await prisma.contentDraft.findUnique({
      where: { id: params.id },
      include: {
        idea: true,
      },
    })

    if (!draft) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 })
    }

    if (draft.status === DraftStatus.REJECTED) {
      return NextResponse.json({ error: 'Draft is already rejected' }, { status: 400 })
    }

    if (draft.status === DraftStatus.AWAITING_REVISION) {
      return NextResponse.json({ error: 'Draft is already in revision state' }, { status: 400 })
    }

    // Update draft status and add feedback
    const updatedDraft = await prisma.contentDraft.update({
      where: { id: params.id },
      data: {
        status: DraftStatus.AWAITING_REVISION,
        feedbacks: {
          create: {
            comment: feedback,
            createdById: session.user.id,
          },
        },
      },
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
    })

    return NextResponse.json(updatedDraft)
  } catch (error) {
    console.error('Failed to reject draft:', error)
    return NextResponse.json(
      { error: 'Failed to reject draft' },
      { status: 500 }
    )
  }
} 