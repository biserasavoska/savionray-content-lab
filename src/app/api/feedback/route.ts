import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DraftStatus } from '@/lib/constants'
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
  const realUserId = validation.realUserId
  
  console.log('🔍 DEBUG: Session validation successful:', {
    sessionUserId: validation.sessionUserId,
    databaseUserId: realUserId,
    userEmail: validation.userEmail,
    userRole: validation.userRole
  })

  try {
    const {
      contentDraftId,
      comment
    } = await req.json()

    if (!contentDraftId || !comment) {
      return NextResponse.json(
        { error: 'Content draft ID and comment are required' },
        { status: 400 }
      )
    }

    const draft = await prisma.contentDraft.findUnique({
      where: { id: contentDraftId },
      include: {
        Idea: true,
      },
    })

    if (!draft) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 })
    }

    if (draft.status === DraftStatus.AWAITING_REVISION) {
      return NextResponse.json(
        { error: 'Cannot add feedback to draft in revision state' },
        { status: 400 }
      )
    }

    // Create enhanced feedback - ✅ Use REAL user ID
    const feedback = await prisma.feedback.create({
      data: {
        comment,
        contentDraftId,
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
    // The status should remain as is, allowing the content to stay in Ready Content
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