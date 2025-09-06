import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions, isCreative, isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'
import { requireOrganizationContext } from '@/lib/utils/organization-context'
import { DRAFT_STATUS } from '@/lib/utils/enum-utils'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only allow creative and admin users to access this endpoint
    if (!isCreative(session) && !isAdmin(session)) {
      return NextResponse.json({ error: 'Forbidden - Creative/Admin access only' }, { status: 403 })
    }

    // Check for organization in headers first (from client selection)
    const selectedOrgId = request.headers.get('x-selected-organization');
    console.log('Agency Stats API - Selected org from header:', selectedOrgId);
    
    const context = await requireOrganizationContext(selectedOrgId || undefined, request)
    if (!context) {
      return NextResponse.json({ error: 'Organization context required' }, { status: 400 })
    }
    
    console.log('Agency Stats API - Organization context:', {
      organizationId: context.organizationId,
      userId: context.userId,
      userEmail: context.userEmail
    });

    // Calculate agency dashboard statistics to match actual page counts
    
    // 1. Total Ideas - same as /ideas page (excluding approved ideas by default)
    const totalIdeas = await prisma.idea.count({
      where: {
        organizationId: context.organizationId,
        status: {
          not: 'APPROVED' // Same filter as ideas page
        }
      }
    })

    // 2. Pending Drafts - same as /ready-content page (awaiting feedback)
    const pendingDrafts = await prisma.contentDraft.count({
      where: {
        organizationId: context.organizationId,
        status: DRAFT_STATUS.AWAITING_FEEDBACK
      }
    })

    // 3. Approved Content - same as /approved page (approved content drafts)
    const approvedContent = await prisma.contentDraft.count({
      where: {
        organizationId: context.organizationId,
        status: DRAFT_STATUS.APPROVED
      }
    })

    // 4. Active Clients - same as /admin/organizations page (total organizations)
    const activeClients = await prisma.organization.count({
      where: {
        subscriptionStatus: {
          not: 'CANCELLED'
        }
      }
    })

    // 5. Content created this month
    const contentThisMonth = await prisma.contentDraft.count({
      where: {
        organizationId: context.organizationId,
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) // First day of current month
        }
      }
    })

    // 6. Pending approvals count (same as pending drafts)
    const pendingApprovals = pendingDrafts

    const stats = {
      totalIdeas,
      pendingDrafts,
      approvedContent,
      activeClients,
      contentThisMonth,
      pendingApprovals
    }

    logger.info('Agency dashboard stats fetched', {
      userId: session.user.id,
      userEmail: session.user.email,
      organizationId: context.organizationId,
      stats
    })

    return NextResponse.json(stats)

  } catch (error) {
    logger.error('Error fetching agency dashboard stats', error as Error)

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
