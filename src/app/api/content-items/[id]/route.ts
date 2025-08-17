import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { requireOrganizationContext } from '@/lib/utils/organization-context'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgContext = await requireOrganizationContext(undefined, req)

    // Try to find the content item
    const contentItem = await prisma.contentItem.findUnique({
      where: { 
        id: params.id,
        organizationId: orgContext.organizationId
      },
      include: {
        User_ContentItem_createdByIdToUser: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        User_ContentItem_assignedToIdToUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        feedbacks: {
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        ContentDeliveryItem: {
          select: {
            id: true,
            contentType: true,
            quantity: true,
            dueDate: true,
            status: true,
            priority: true,
            notes: true,
          },
        },
        comments: {
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        media: {
          select: {
            id: true,
            url: true,
            filename: true,
            contentType: true,
            size: true,
          },
        },
        stageHistory: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            transitionedAt: 'desc',
          },
        },
      },
    })

    if (!contentItem) {
      return NextResponse.json({ error: 'Content item not found' }, { status: 404 })
    }

    return NextResponse.json(contentItem)
  } catch (error) {
    console.error('Failed to fetch content item:', error)
    return NextResponse.json(
      { error: 'Failed to fetch content item' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgContext = await requireOrganizationContext(undefined, req)
    const body = await req.json()

    // Check if content item exists and user has permission
    const existingItem = await prisma.contentItem.findUnique({
      where: { 
        id: params.id,
        organizationId: orgContext.organizationId
      },
      select: { createdById: true }
    })

    if (!existingItem) {
      return NextResponse.json({ error: 'Content item not found' }, { status: 404 })
    }

    // Only creator or admin can update
    if (existingItem.createdById !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const updatedItem = await prisma.contentItem.update({
      where: { id: params.id },
      data: {
        title: body.title,
        description: body.description,
        body: body.body,
        contentType: body.contentType,
        mediaType: body.mediaType,
        metadata: body.metadata,
        status: body.status,
        currentStage: body.currentStage,
        assignedToId: body.assignedToId,
      },
      include: {
        User_ContentItem_createdByIdToUser: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        User_ContentItem_assignedToIdToUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(updatedItem)
  } catch (error) {
    console.error('Failed to update content item:', error)
    return NextResponse.json(
      { error: 'Failed to update content item' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgContext = await requireOrganizationContext(undefined, req)

    // Check if content item exists and user has permission
    const existingItem = await prisma.contentItem.findUnique({
      where: { 
        id: params.id,
        organizationId: orgContext.organizationId
      },
      select: { createdById: true }
    })

    if (!existingItem) {
      return NextResponse.json({ error: 'Content item not found' }, { status: 404 })
    }

    // Only creator or admin can delete
    if (existingItem.createdById !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    await prisma.contentItem.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete content item:', error)
    return NextResponse.json(
      { error: 'Failed to delete content item' },
      { status: 500 }
    )
  }
}
