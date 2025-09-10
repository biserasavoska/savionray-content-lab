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

    // Check for organization in headers first (from client selection)
    const selectedOrgId = request.headers.get('x-selected-organization');
    console.log('Client Stats API - Selected org from header:', selectedOrgId);
    
    const orgContext = await getOrganizationContext(selectedOrgId || undefined, request)
    if (!orgContext) {
      return NextResponse.json({ error: 'Organization context not found' }, { status: 400 })
    }
    
    console.log('Client Stats API - Organization context:', {
      organizationId: orgContext.organizationId,
      userId: orgContext.userId,
      userEmail: orgContext.userEmail
    });

    // Calculate dashboard statistics
    const [
      totalIdeasCount,
      pendingDraftsCount,
      pendingApprovalsCount,
      approvedCount,
      feedbackProvidedCount,
      totalContentCount
    ] = await Promise.all([
      // Total ideas count
      prisma.idea.count({
        where: {
          organizationId: orgContext.organizationId
        }
      }),

      // Pending drafts count (DRAFT status)
      prisma.contentDraft.count({
        where: {
          organizationId: orgContext.organizationId,
          status: DRAFT_STATUS.DRAFT
        }
      }),

      // Pending approvals count (AWAITING_FEEDBACK status)
      prisma.contentDraft.count({
        where: {
          organizationId: orgContext.organizationId,
          status: DRAFT_STATUS.AWAITING_FEEDBACK
        }
      }),

      // Approved count
      prisma.contentDraft.count({
        where: {
          organizationId: orgContext.organizationId,
          status: DRAFT_STATUS.APPROVED
        }
      }),

      // Feedback provided count (last 30 days) - includes both Ideas and ContentDrafts
      prisma.feedback.count({
        where: {
          OR: [
            {
              ContentDraft: {
                organizationId: orgContext.organizationId
              }
            },
            {
              Idea: {
                organizationId: orgContext.organizationId
              }
            }
          ],
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
          }
        }
      }),

      // Total content count
      prisma.contentDraft.count({
        where: {
          organizationId: orgContext.organizationId
        }
      })
    ])

    const stats = {
      totalIdeas: totalIdeasCount,
      pendingDrafts: pendingDraftsCount,
      pendingApprovals: pendingApprovalsCount,
      approved: approvedCount,
      feedbackProvided: feedbackProvidedCount,
      totalContent: totalContentCount
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