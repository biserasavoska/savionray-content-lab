import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions, isCreative, isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'
import { requireOrganizationContext } from '@/lib/utils/organization-context'

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
    console.log('Agency Activity API - Selected org from header:', selectedOrgId);
    
    const context = await requireOrganizationContext(selectedOrgId || undefined, request)
    if (!context) {
      return NextResponse.json({ error: 'Organization context required' }, { status: 400 })
    }
    
    console.log('Agency Activity API - Organization context:', {
      organizationId: context.organizationId,
      userId: context.userId,
      userEmail: context.userEmail
    });

    // Get recent activity from ideas, content drafts, and published content
    const [recentIdeas, recentDrafts, recentPublished] = await Promise.all([
      // Recent ideas
      prisma.idea.findMany({
        where: {
          organizationId: context.organizationId
        },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          User: {
            select: { name: true, email: true }
          }
        }
      }),

      // Recent content drafts
      prisma.contentDraft.findMany({
        where: {
          organizationId: context.organizationId
        },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          User: {
            select: { name: true, email: true }
          },
          Idea: {
            select: { title: true }
          }
        }
      }),

      // Recent published content
      prisma.contentDraft.findMany({
        where: {
          organizationId: context.organizationId,
          status: 'PUBLISHED'
        },
        take: 5,
        orderBy: { updatedAt: 'desc' },
        include: {
          User: {
            select: { name: true, email: true }
          },
          Idea: {
            select: { title: true }
          }
        }
      })
    ])

    // Combine and format recent activity
    const recentActivity = [
      ...recentIdeas.map(idea => ({
        id: idea.id,
        type: 'idea',
        title: idea.title,
        status: idea.status,
        client: idea.User?.name || idea.User?.email || 'Unknown',
        createdAt: idea.createdAt.toISOString()
      })),
      ...recentDrafts.map(draft => ({
        id: draft.id,
        type: 'draft',
        title: draft.Idea?.title || 'Untitled Content',
        status: draft.status,
        client: draft.User?.name || draft.User?.email || 'Unknown',
        createdAt: draft.createdAt.toISOString()
      })),
      ...recentPublished.map(published => ({
        id: published.id,
        type: 'content',
        title: published.Idea?.title || 'Untitled Content',
        status: 'PUBLISHED',
        client: published.User?.name || published.User?.email || 'Unknown',
        createdAt: published.updatedAt.toISOString()
      }))
    ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10) // Get top 10 most recent activities

    logger.info('Agency recent activity fetched', {
      userId: session.user.id,
      userEmail: session.user.email,
      organizationId: context.organizationId,
      activityCount: recentActivity.length
    })

    return NextResponse.json({ activity: recentActivity })

  } catch (error) {
    logger.error('Error fetching agency recent activity', error as Error)

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
