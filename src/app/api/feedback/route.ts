import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DRAFT_STATUS } from '@/lib/utils/enum-constants'
import { validateSessionUser } from '@/lib/utils/session-validation'

export async function POST(req: NextRequest) {
  // 🚨 CRITICAL: Use session validation utility to get REAL user ID
  const validation = await validateSessionUser()
  
  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error },
      { status: validation.status || 401 }
    )
  }
  
      // Use the REAL user ID from database, not the session ID
    const realUserId = validation.realUserId!
  
  console.log('🔍 DEBUG: Session validation successful:', {
    sessionUserId: validation.sessionUserId,
    databaseUserId: realUserId,
    userEmail: validation.userEmail,
    userRole: validation.userRole
  })

  try {
    const {
      contentDraftId,
      ideaId,
      comment,
      rating = 0,
      category = 'general',
      priority = 'medium',
      actionable = false
    } = await req.json()

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment is required' },
        { status: 400 }
      )
    }

    if (!contentDraftId && !ideaId) {
      return NextResponse.json(
        { error: 'Either content draft ID or idea ID is required' },
        { status: 400 }
      )
    }

    if (contentDraftId && ideaId) {
      return NextResponse.json(
        { error: 'Cannot provide both content draft ID and idea ID' },
        { status: 400 }
      )
    }

    // Validate content draft if provided
    if (contentDraftId) {
      const draft = await prisma.contentDraft.findUnique({
        where: { id: contentDraftId },
        include: {
          Idea: true,
        },
      })

      if (!draft) {
        return NextResponse.json({ error: 'Draft not found' }, { status: 404 })
      }

      if (draft.status === DRAFT_STATUS.AWAITING_REVISION) {
        return NextResponse.json(
          { error: 'Cannot add feedback to draft in revision state' },
          { status: 400 }
        )
      }
    }

    // Validate idea if provided
    if (ideaId) {
      const idea = await prisma.idea.findUnique({
        where: { id: ideaId },
      })

      if (!idea) {
        return NextResponse.json({ error: 'Idea not found' }, { status: 404 })
      }
    }

    // Create enhanced feedback - ✅ Use REAL user ID
    const feedback = await prisma.feedback.create({
      data: {
        comment,
        contentDraftId: contentDraftId || null,
        ideaId: ideaId || null,
        rating,
        category,
        priority,
        actionable,
        createdById: realUserId,
      },
      include: {
        User: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    // Don't automatically change status when feedback is submitted
    // The status should remain as is, allowing the content to stay in Drafts
    // Status changes should be done explicitly by users through the UI

    return NextResponse.json(feedback)
  } catch (error) {
    console.error('Failed to create feedback:', error)
    return NextResponse.json({ error: 'Failed to create feedback' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  // 🚨 CRITICAL: Use session validation utility to get REAL user ID
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

  if (draftId && ideaId) {
    return NextResponse.json(
      { error: 'Cannot provide both draft ID and idea ID' },
      { status: 400 }
    )
  }

  try {
    const whereClause = draftId 
      ? { contentDraftId: draftId }
      : { ideaId: ideaId }

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

    return NextResponse.json(feedbacks)
  } catch (error) {
    console.error('Failed to fetch feedbacks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feedbacks' },
      { status: 500 }
    )
  }
} 