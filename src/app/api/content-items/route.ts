import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { prisma } from '@/lib/prisma'
import { authOptions , isCreative, isAdmin } from '@/lib/auth'
import { CONTENT_TYPE, CONTENT_ITEM_STATUS, WORKFLOW_STAGE } from '@/lib/utils/enum-constants'
import { requireOrganizationContextWithOverride } from '@/lib/utils/organization-context'
import { logger } from '@/lib/utils/logger'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isCreative(session) && !isAdmin(session)) {
      return NextResponse.json({ error: 'Only creatives and admins can create content items' }, { status: 403 })
    }

    const body = await req.json()
    const { 
      title, 
      description, 
      body: contentBody, 
      contentType, 
      mediaType,
      metadata,
      assignedToId,
      deliveryItemId,
      // Manual organization override
      organizationId: manualOrganizationId
    } = body

    // Validate required fields
    if (!title || !description || !contentType) {
      return NextResponse.json({ error: 'Title, description, and content type are required' }, { status: 400 })
    }

    if (!Object.values(CONTENT_TYPE).includes(contentType)) {
      return NextResponse.json({ error: 'Invalid content type' }, { status: 400 })
    }

    // Get organization context with manual override support
    const orgContext = await requireOrganizationContextWithOverride(manualOrganizationId)

    // Create the content item
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
        createdById: session.user.id,
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
      createdBy: session.user.id,
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