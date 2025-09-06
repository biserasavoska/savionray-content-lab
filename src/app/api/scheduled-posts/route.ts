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

    if (!isCreative(session) && !isAdmin(session)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check for organization in headers first (from client selection)
    const selectedOrgId = request.headers.get('x-selected-organization');
    console.log('Scheduled Posts API - Selected org from header:', selectedOrgId);
    
    const context = await requireOrganizationContext(selectedOrgId || undefined, request)
    if (!context) {
      return NextResponse.json({ error: 'Organization context required' }, { status: 400 })
    }
    
    console.log('Scheduled Posts API - Organization context:', {
      organizationId: context.organizationId,
      userId: context.userId,
      userEmail: context.userEmail
    });

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')
    const skip = (page - 1) * limit

    // Fetch scheduled posts
    const scheduledPosts = await prisma.scheduledPost.findMany({
      where: {
        contentDraft: {
          organizationId: context.organizationId,
          ...(isCreative(session) ? { createdById: session.user.id } : {}),
        },
      },
      include: {
        contentDraft: {
          include: {
            User: {
              select: {
                name: true,
                email: true,
              },
            },
            Idea: {
              select: {
                title: true,
              },
            },
          },
        },
      },
      orderBy: {
        scheduledDate: 'asc',
      },
      skip,
      take: limit
    })

    // Get total count for pagination
    const totalCount = await prisma.scheduledPost.count({
      where: {
        contentDraft: {
          organizationId: context.organizationId,
          ...(isCreative(session) ? { createdById: session.user.id } : {}),
        },
      }
    })

    logger.info('Scheduled posts fetched', {
      userId: session.user.id,
      userEmail: session.user.email,
      organizationId: context.organizationId,
      postsCount: scheduledPosts.length,
      totalCount,
      page,
      limit
    })

    return NextResponse.json({
      posts: scheduledPosts,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })

  } catch (error) {
    logger.error('Error fetching scheduled posts', error as Error)

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
