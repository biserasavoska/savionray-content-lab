import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions, isAdmin, isCreative } from '@/lib/auth'
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

    // Get organization context from header
    const context = await requireOrganizationContext(undefined, request)
    if (!context) {
      return NextResponse.json({ error: 'Organization context not found' }, { status: 400 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')
    const period = searchParams.get('period') // Format: "October" or "October 2024"
    const skip = (page - 1) * limit

    // Determine user role for filtering
    const isUserCreative = session ? isCreative(session) : false;
    const isUserAdmin = session ? isAdmin(session) : false;
    const isUserClient = session?.user?.role === 'CLIENT';

    // Build where clause with role-based status filtering
    const where: any = {
      organizationId: context.organizationId,
    };

    // Apply role-based status filtering
    if (isUserClient) {
      // Client users can only see content that's been submitted for review
      where.status = {
        in: [
          DRAFT_STATUS.AWAITING_FEEDBACK,
          DRAFT_STATUS.AWAITING_REVISION,
          DRAFT_STATUS.APPROVED,
          DRAFT_STATUS.REJECTED
        ]
      };
    } else {
      // Admin and Creative users can see all content including drafts
      where.status = {
        in: [
          DRAFT_STATUS.DRAFT,
          DRAFT_STATUS.AWAITING_FEEDBACK,
          DRAFT_STATUS.AWAITING_REVISION,
          DRAFT_STATUS.APPROVED,
          DRAFT_STATUS.REJECTED
        ]
      };
    }

    // Apply period filter if provided
    if (period && period !== 'ALL') {
      const currentYear = new Date().getFullYear();
      const parts = period.split(' ');
      const monthName = parts[0];
      const year = parts.length > 1 ? parseInt(parts[1]) : currentYear;
      
      // Create date range for the month
      const startDate = new Date(year, new Date(`${monthName} 1, ${year}`).getMonth(), 1);
      const endDate = new Date(year, new Date(`${monthName} 1, ${year}`).getMonth() + 1, 0, 23, 59, 59);
      
      where.Idea = {
        publishingDateTime: {
          gte: startDate,
          lte: endDate
        }
      };
    }

    // Fetch content ready for review (all relevant statuses)
    const readyContent = await prisma.contentDraft.findMany({
      where,
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
        Feedback: {
          include: {
            User: {
              select: {
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        Media: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: [
        {
          Idea: {
            publishingDateTime: 'asc'
          }
        },
        {
          Idea: {
            createdAt: 'asc'
          }
        },
        {
          status: 'asc'
        },
        {
          updatedAt: 'desc'
        }
      ],
      skip,
      take: limit
    })

    // Get total count for pagination
    const totalCount = await prisma.contentDraft.count({
      where
    })

    // Sanitize the data
    const safeContent = sanitizeContentDraftsData(readyContent)

    logger.info('Ready content fetched', {
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
    logger.error('Error fetching ready content', error as Error)

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 