import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { withDbLogging } from '@/lib/middleware/logger'
import { logger } from '@/lib/utils/logger'
import { requireOrganizationContext } from '@/lib/utils/organization-context'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = `stats-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const organizationId = params.id

    // Verify user has access to this organization
    const userOrgAccess = await prisma.organizationUser.findFirst({
      where: {
        userId: session.user.id,
        organizationId: organizationId,
        isActive: true
      }
    })

    if (!userOrgAccess) {
      return NextResponse.json(
        { error: 'Access denied to organization' },
        { status: 403 }
      )
    }

    // Get organization statistics
    const getStats = withDbLogging('get', 'OrganizationStats', async () => {
      const [
        totalIdeas,
        totalContentDrafts,
        totalPublishedContent,
        totalDeliveryPlans,
        activeUsers,
        recentIdeas,
        recentDrafts,
        recentPublished,
        recentPlans
      ] = await Promise.all([
        // Total counts
        prisma.idea.count({
          where: { organizationId }
        }),
        prisma.contentDraft.count({
          where: { organizationId }
        }),
        prisma.contentItem.count({
          where: { 
            organizationId,
            status: 'PUBLISHED'
          }
        }),
        prisma.contentDeliveryPlan.count({
          where: { organizationId }
        }),
        prisma.organizationUser.count({
          where: { 
            organizationId,
            isActive: true
          }
        }),
        
        // Recent activity
        prisma.idea.findMany({
          where: { organizationId },
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            User: {
              select: { name: true }
            }
          }
        }),
        prisma.contentDraft.findMany({
          where: { organizationId },
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            User: {
              select: { name: true }
            }
          }
        }),
        prisma.contentItem.findMany({
          where: { 
            organizationId,
            status: 'PUBLISHED'
          },
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            User_ContentItem_createdByIdToUser: {
              select: { name: true }
            }
          }
        }),
        prisma.contentDeliveryPlan.findMany({
          where: { organizationId },
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            client: {
              select: { name: true }
            }
          }
        })
      ])

      // Combine and sort recent activity
      const recentActivity = [
        ...recentIdeas.map(idea => ({
          id: idea.id,
          type: 'idea' as const,
          title: idea.title,
          createdAt: idea.createdAt.toISOString(),
          createdBy: idea.User.name || 'Unknown'
        })),
        ...recentDrafts.map(draft => ({
          id: draft.id,
          type: 'draft' as const,
          title: `Draft for ${draft.contentType}`,
          createdAt: draft.createdAt.toISOString(),
          createdBy: draft.User.name || 'Unknown'
        })),
        ...recentPublished.map(item => ({
          id: item.id,
          type: 'published' as const,
          title: item.title || 'Untitled Content',
          createdAt: item.createdAt.toISOString(),
          createdBy: item.User_ContentItem_createdByIdToUser.name || 'Unknown'
        })),
        ...recentPlans.map(plan => ({
          id: plan.id,
          type: 'plan' as const,
          title: plan.name || 'Untitled Plan',
          createdAt: plan.createdAt.toISOString(),
          createdBy: plan.client.name || 'Unknown'
        }))
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)

      return {
        totalIdeas,
        totalContentDrafts,
        totalPublishedContent,
        totalDeliveryPlans,
        activeUsers,
        recentActivity
      }
    })

    const stats = await getStats()

    logger.info('Organization statistics fetched', {
      requestId,
      userId: session.user.id,
      userEmail: session.user.email,
      organizationId,
      stats: {
        totalIdeas: stats.totalIdeas,
        totalContentDrafts: stats.totalContentDrafts,
        totalPublishedContent: stats.totalPublishedContent,
        totalDeliveryPlans: stats.totalDeliveryPlans,
        activeUsers: stats.activeUsers,
        recentActivityCount: stats.recentActivity.length
      }
    })

    return NextResponse.json(stats)
  } catch (error) {
    logger.error('Error fetching organization statistics', error instanceof Error ? error : new Error(String(error)), {
      requestId,
      organizationId: params.id
    })
    
    return NextResponse.json(
      { error: 'Failed to fetch organization statistics' },
      { status: 500 }
    )
  }
} 