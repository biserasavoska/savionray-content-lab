import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'
import { getOrganizationContext } from '@/lib/utils/organization-context'
import { DRAFT_STATUS } from '@/lib/utils/enum-utils'
import { sanitizeContentDraftsData } from '@/lib/utils/data-sanitization'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get organization context
    const orgContext = await getOrganizationContext(undefined, request)
    if (!orgContext) {
      return NextResponse.json({ error: 'Organization context not found' }, { status: 400 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')
    const skip = (page - 1) * limit

    // Fetch content ready for review (awaiting feedback)
    const readyContent = await prisma.contentDraft.findMany({
      where: {
        organizationId: orgContext.organizationId,
        status: DRAFT_STATUS.AWAITING_FEEDBACK
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
      where: {
        organizationId: orgContext.organizationId,
        status: DRAFT_STATUS.AWAITING_FEEDBACK
      }
    })

    // Sanitize the data
    const safeContent = sanitizeContentDraftsData(readyContent)

    logger.info('Ready content fetched', {
      userId: session.user.id,
      userEmail: session.user.email,
      organizationId: orgContext.organizationId,
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