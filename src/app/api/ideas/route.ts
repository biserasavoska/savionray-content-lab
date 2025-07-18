import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { prisma } from '@/lib/prisma'
import { authOptions , isCreative, isAdmin, isClient } from '@/lib/auth'
import { IDEA_STATUS, isValidIdeaStatus } from '@/lib/utils/enum-utils'
import { 
  handleApiError, 
  generateRequestId, 
  createAuthenticationError,
  createAuthorizationError,
  createValidationError,
  validateRequired,
  validateString
} from '@/lib/utils/error-handling'
import { withLogging, withDbLogging } from '@/lib/middleware/logger'
import { logger } from '@/lib/utils/logger'
import { requireOrganizationContext, createOrgFilter } from '@/lib/utils/organization-context'

export async function POST(req: NextRequest) {
  const requestId = generateRequestId()
  
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      const error = createAuthenticationError('Authentication required to create ideas')
      const { status, body } = await handleApiError(error, requestId)
      return NextResponse.json(body, { status })
    }

    if (!isCreative(session) && !isAdmin(session)) {
      const error = createAuthorizationError('Only creatives and admins can create ideas')
      const { status, body } = await handleApiError(error, requestId)
      return NextResponse.json(body, { status })
    }

    // Get organization context for multi-tenant isolation
    // Check if organization ID is provided in headers (from frontend context)
    const organizationId = req.headers.get('x-organization-id') || undefined
    const orgContext = await requireOrganizationContext(organizationId)

    const { title, description, publishingDateTime, savedForLater, mediaType, contentType } = await req.json()

    // Validate required fields
    const titleError = validateRequired(title, 'title')
    if (titleError) {
      const { status, body } = await handleApiError(titleError, requestId)
      return NextResponse.json(body, { status })
    }

    const descriptionError = validateRequired(description, 'description')
    if (descriptionError) {
      const { status, body } = await handleApiError(descriptionError, requestId)
      return NextResponse.json(body, { status })
    }

    const contentTypeError = validateRequired(contentType, 'contentType')
    if (contentTypeError) {
      const { status, body } = await handleApiError(contentTypeError, requestId)
      return NextResponse.json(body, { status })
    }

    // Validate string lengths
    const titleLengthError = validateString(title, 'title', 1, 200)
    if (titleLengthError) {
      const { status, body } = await handleApiError(titleLengthError, requestId)
      return NextResponse.json(body, { status })
    }

    const descriptionLengthError = validateString(description, 'description', 1, 1000)
    if (descriptionLengthError) {
      const { status, body } = await handleApiError(descriptionLengthError, requestId)
      return NextResponse.json(body, { status })
    }

    const createIdea = withDbLogging('create', 'Idea', async () => {
      return await prisma.idea.create({
        data: {
          title,
          description,
          publishingDateTime: publishingDateTime ? new Date(publishingDateTime) : null,
          savedForLater: savedForLater || false,
          mediaType: mediaType || null,
          contentType,
          createdById: session.user.id,
          organizationId: orgContext.organizationId, // Add organization isolation
        },
        include: {
          createdBy: {
            select: {
              name: true,
              email: true,
            },
          },
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
              primaryColor: true,
            },
          },
        },
      })
    })

    const idea = await createIdea()

    return NextResponse.json({
      success: true,
      data: idea,
      requestId
    })
  } catch (error) {
    const { status, body } = await handleApiError(error, requestId)
    return NextResponse.json(body, { status })
  }
}

export async function GET(req: NextRequest) {
  const requestId = generateRequestId()
  
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      const error = createAuthenticationError('Authentication required to view ideas')
      const { status, body } = await handleApiError(error, requestId)
      return NextResponse.json(body, { status })
    }

    // Get organization context for multi-tenant isolation
    // Check if organization ID is provided in headers (from frontend context)
    const organizationId = req.headers.get('x-organization-id') || undefined
    const orgContext = await requireOrganizationContext(organizationId)

    const url = new URL(req.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const skip = (page - 1) * limit
    const status = url.searchParams.get('status')

    // Use centralized enum constants instead of hardcoded strings
    const statusFilter = status && isValidIdeaStatus(status) ? { status: { equals: status } } : undefined;

    // Create organization-aware filter
    const orgFilter = createOrgFilter(orgContext.organizationId)
    const whereClause = {
      ...orgFilter,
      ...statusFilter
    }

    const countIdeas = withDbLogging('count', 'Idea', async () => {
      return await prisma.idea.count({
        where: whereClause,
      })
    })

    const findIdeas = withDbLogging('findMany', 'Idea', async () => {
      return await prisma.idea.findMany({
        where: whereClause,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
        include: {
          createdBy: {
            select: {
              name: true,
              email: true,
            },
          },
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
              primaryColor: true,
            },
          },
          comments: {
            include: {
              createdBy: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
          contentDrafts: {
            include: {
              feedbacks: {
                include: {
                  createdBy: {
                    select: {
                      name: true,
                      email: true,
                    },
                  },
                },
                orderBy: {
                  createdAt: 'desc',
                },
              },
            },
          },
        },
      })
    })

    const totalCount = await countIdeas()
    const ideas = await findIdeas()

    return NextResponse.json({
      success: true,
      data: {
        ideas,
        pagination: {
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
          current: page,
          limit,
        },
      },
      requestId
    })
  } catch (error) {
    const { status, body } = await handleApiError(error, requestId)
    return NextResponse.json(body, { status })
  }
} 