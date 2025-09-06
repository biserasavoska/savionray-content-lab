import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'
import { requireOrganizationContext } from '@/lib/utils/organization-context'
import { DRAFT_STATUS } from '@/lib/utils/enum-utils'
import { sanitizeContentDraftsData } from '@/lib/utils/data-sanitization'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check for organization in headers first (from client selection)
    const selectedOrgId = request.headers.get('x-selected-organization');
    console.log('Published Content API - Selected org from header:', selectedOrgId);
    
    const context = await requireOrganizationContext(selectedOrgId || undefined, request)
    if (!context) {
      return NextResponse.json({ error: 'Organization context required' }, { status: 400 })
    }
    
    console.log('Published Content API - Organization context:', {
      organizationId: context.organizationId,
      userId: context.userId,
      userEmail: context.userEmail
    });

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')
    const skip = (page - 1) * limit

    // Fetch published content
    const publishedContent = await prisma.contentDraft.findMany({
      where: {
        organizationId: context.organizationId,
        status: DRAFT_STATUS.PUBLISHED
      },
      include: {
        Idea: {
          include: {
            User: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                image: true
              }
            }
          }
        },
        User: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            image: true
          }
        },
        scheduledPosts: {
          orderBy: {
            scheduledDate: 'desc'
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      skip,
      take: limit
    })

    // Get total count for pagination
    const totalCount = await prisma.contentDraft.count({
      where: {
        organizationId: context.organizationId,
        status: DRAFT_STATUS.PUBLISHED
      }
    })

    // Sanitize the data
    const safeContent = sanitizeContentDraftsData(publishedContent)

    logger.info('Published content fetched', {
      userId: session.user.id,
      userEmail: session.user.email,
      organizationId: context.organizationId,
      contentCount: safeContent.length,
      totalCount,
      page,
      limit
    })

    return NextResponse.json({
      content: safeContent,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })

  } catch (error) {
    logger.error('Error fetching published content', error as Error)

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
