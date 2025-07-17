import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions, isClient } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'
import { getOrganizationContext } from '@/lib/utils/organization-context'
import { DRAFT_STATUS } from '@/lib/utils/enum-utils'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only allow client users to access this endpoint
    if (!isClient(session)) {
      return NextResponse.json({ error: 'Forbidden - Client access only' }, { status: 403 })
    }

    // Get organization context
    const orgContext = await getOrganizationContext(undefined, request)
    if (!orgContext) {
      return NextResponse.json({ error: 'Organization context not found' }, { status: 400 })
    }

    // Calculate dashboard statistics
    const [
      pendingReviewCount,
      recentlyApprovedCount,
      totalContentCount,
      feedbackProvidedCount,
      overdueItemsCount,
      thisWeekDeadlinesCount
    ] = await Promise.all([
      // Pending review count
      prisma.contentDraft.count({
        where: {
          organizationId: orgContext.organizationId,
          status: DRAFT_STATUS.AWAITING_FEEDBACK
        }
      }),

      // Recently approved count (last 7 days)
      prisma.contentDraft.count({
        where: {
          organizationId: orgContext.organizationId,
          status: DRAFT_STATUS.APPROVED,
          updatedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
          }
        }
      }),

      // Total content count
      prisma.contentDraft.count({
        where: {
          organizationId: orgContext.organizationId
        }
      }),

      // Feedback provided count (last 30 days)
      prisma.feedback.count({
        where: {
          contentDraft: {
            organizationId: orgContext.organizationId
          },
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
          }
        }
      }),

      // Overdue items count (items with due dates in the past)
      prisma.contentDraft.count({
        where: {
          organizationId: orgContext.organizationId,
          status: DRAFT_STATUS.AWAITING_FEEDBACK
        }
      }),

      // This week deadlines count
      prisma.contentDraft.count({
        where: {
          organizationId: orgContext.organizationId,
          status: DRAFT_STATUS.AWAITING_FEEDBACK
        }
      })
    ])

    const stats = {
      pendingReview: pendingReviewCount,
      recentlyApproved: recentlyApprovedCount,
      totalContent: totalContentCount,
      feedbackProvided: feedbackProvidedCount,
      overdueItems: overdueItemsCount,
      thisWeekDeadlines: thisWeekDeadlinesCount
    }

    logger.info('Client dashboard stats fetched', {
      userId: session.user.id,
      userEmail: session.user.email,
      organizationId: orgContext.organizationId,
      stats
    })

    return NextResponse.json(stats)

  } catch (error) {
    logger.error('Error fetching client dashboard stats', error as Error)

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 