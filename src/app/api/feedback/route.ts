import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { DraftStatus } from '@prisma/client'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { contentDraftId, comment } = await req.json()

    if (!contentDraftId || !comment) {
      return NextResponse.json(
        { error: 'Content draft ID and comment are required' },
        { status: 400 }
      )
    }

    const draft = await prisma.contentDraft.findUnique({
      where: { id: contentDraftId },
      include: {
        idea: true,
      },
    })

    if (!draft) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 })
    }

    // Create feedback
    const feedback = await prisma.feedback.create({
      data: {
        comment,
        contentDraftId,
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

    // Update draft status if needed
    if (draft.status === DraftStatus.NEEDS_REVISION) {
      await prisma.contentDraft.update({
        where: { id: contentDraftId },
        data: {
          status: DraftStatus.DRAFT,
        },
      })
    }

    return NextResponse.json(feedback)
  } catch (error) {
    console.error('Failed to create feedback:', error)
    return NextResponse.json({ error: 'Failed to create feedback' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(req.url)
  const draftId = url.searchParams.get('draftId')

  if (!draftId) {
    return NextResponse.json(
      { error: 'Draft ID is required' },
      { status: 400 }
    )
  }

  try {
    const feedbacks = await prisma.feedback.findMany({
      where: {
        contentDraftId: draftId,
      },
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
    })

    return NextResponse.json(feedbacks)
  } catch (error) {
    console.error('Failed to fetch feedbacks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feedbacks' },
      { status: 500 }
    )
  }
} 