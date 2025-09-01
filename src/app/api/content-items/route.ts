import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'
import { requireOrganizationContext, requireOrganizationContextWithOverride } from '@/lib/utils/organization-context'
import { CONTENT_ITEM_STATUS, CONTENT_TYPE, WORKFLOW_STAGE } from '@/lib/utils/enum-constants'
import { validateSessionUser } from '@/lib/utils/session-validation'

export async function POST(request: NextRequest) {
  try {
    // 🚨 CRITICAL: Use session validation utility to get REAL user ID
    const validation = await validateSessionUser()
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status || 401 }
      )
    }
    
    // Use the REAL user ID from database, not the session ID
    const realUserId = validation.realUserId
    
    console.log('🔍 DEBUG: Session validation successful:', {
      sessionUserId: validation.sessionUserId,
      databaseUserId: realUserId,
      userEmail: validation.userEmail,
      userRole: validation.userRole
    })

    // Get organization context
    const orgContext = await requireOrganizationContext(undefined, request)
    if (!orgContext) {
      return NextResponse.json({ error: 'Organization context required' }, { status: 400 })
    }

    const body = await request.json()
    const { 
      title, 
      description, 
      contentBody,
      contentType,
      mediaType,
      metadata,
      assignedToId,
      deliveryItemId,
      manualOrganizationId
    } = body

    if (!title || !contentType) {
      return NextResponse.json({ error: 'Title and content type are required' }, { status: 400 })
    }

    // Create content item - ✅ Use REAL user ID
    const contentItem = await prisma.contentItem.create({
      data: {
        title,
        description,
        body: contentBody || null,
        contentType: contentType as any,
        mediaType: mediaType || null,
        metadata: metadata || {},
        status: CONTENT_ITEM_STATUS.IDEA,
        currentStage: WORKFLOW_STAGE.IDEA,
        createdById: realUserId,
        assignedToId: assignedToId || null,
        deliveryItemId: deliveryItemId || null,
        organizationId: orgContext.organizationId, // Use the resolved organization ID
      },
      include: {
        User_ContentItem_createdByIdToUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        User_ContentItem_assignedToIdToUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        Organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            primaryColor: true,
          },
        },
      },
    })

    logger.info('Content item created', {
      contentItemId: contentItem.id,
      title: contentItem.title,
      organizationId: contentItem.organizationId,
      organizationName: contentItem.Organization.name,
      createdBy: realUserId,
      manualOverride: !!manualOrganizationId
    })

    return NextResponse.json(contentItem)
  } catch (error) {
    logger.error('Error creating content item', error instanceof Error ? error : new Error(String(error)))
    return NextResponse.json(
      { error: 'Failed to create content item' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get organization context
    const orgContext = await requireOrganizationContextWithOverride()

    // Get query parameters
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const contentType = searchParams.get('contentType')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Build where clause
    const where: any = {
      organizationId: orgContext.organizationId,
    }

    if (status && Object.values(CONTENT_ITEM_STATUS).includes(status as any)) {
      where.status = status
    }

    if (contentType && Object.values(CONTENT_TYPE).includes(contentType as any)) {
      where.contentType = contentType
    }

    // Get content items
    const [contentItems, total] = await Promise.all([
      prisma.contentItem.findMany({
        where,
        include: {
          User_ContentItem_createdByIdToUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          User_ContentItem_assignedToIdToUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          Organization: {
            select: {
              id: true,
              name: true,
              slug: true,
              primaryColor: true,
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
        skip: offset,
        take: limit,
      }),
      prisma.contentItem.count({ where }),
    ])

    return NextResponse.json({
      contentItems,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    logger.error('Error fetching content items', error instanceof Error ? error : new Error(String(error)))
    return NextResponse.json(
      { error: 'Failed to fetch content items' },
      { status: 500 }
    )
  }
} 