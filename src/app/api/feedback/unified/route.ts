import { NextRequest, NextResponse } from 'next/server'
import { validateSessionUser } from '@/lib/utils/session-validation'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  // Validate session
  const validation = await validateSessionUser()
  
  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error },
      { status: validation.status || 401 }
    )
  }

  const url = new URL(req.url)
  const draftId = url.searchParams.get('draftId')
  const ideaId = url.searchParams.get('ideaId')

  if (!draftId && !ideaId) {
    return NextResponse.json(
      { error: 'Either draft ID or idea ID is required' },
      { status: 400 }
    )
  }

  try {
    let whereClause: any = {}

    if (draftId) {
      // If we have a draft ID, get feedback for both the draft and its associated idea
      const draft = await prisma.contentDraft.findUnique({
        where: { id: draftId },
        select: { ideaId: true }
      })

      if (!draft) {
        return NextResponse.json({ error: 'Draft not found' }, { status: 404 })
      }

      // Get feedback for both the draft and its associated idea
      whereClause = {
        OR: [
          { contentDraftId: draftId },
          { ideaId: draft.ideaId }
        ]
      }
    } else if (ideaId) {
      // If we have an idea ID, get feedback for the idea and any drafts created from it
      const drafts = await prisma.contentDraft.findMany({
        where: { ideaId: ideaId },
        select: { id: true }
      })

      const draftIds = drafts.map(d => d.id)

      whereClause = {
        OR: [
          { ideaId: ideaId },
          ...(draftIds.length > 0 ? [{ contentDraftId: { in: draftIds } }] : [])
        ]
      }
    }

    const feedbacks = await prisma.feedback.findMany({
      where: whereClause,
      include: {
        User: {
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

    // Add metadata to each feedback to indicate its source
    const feedbacksWithMetadata = feedbacks.map(feedback => ({
      ...feedback,
      source: feedback.contentDraftId ? 'draft' : 'idea',
      sourceId: feedback.contentDraftId || feedback.ideaId
    }))

    return NextResponse.json(feedbacksWithMetadata)
  } catch (error) {
    console.error('Failed to fetch unified feedbacks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feedbacks' },
      { status: 500 }
    )
  }
}
