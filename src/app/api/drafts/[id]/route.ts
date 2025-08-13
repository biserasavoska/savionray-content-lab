import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { prisma } from '@/lib/prisma'
import { authOptions , isCreative, isAdmin } from '@/lib/auth'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { body, contentType, status, metadata } = await req.json()

    if (!body && !status && !metadata) {
      return NextResponse.json(
        { error: 'At least one field to update is required' },
        { status: 400 }
      )
    }

    const draft = await prisma.contentDraft.findUnique({
      where: { id: params.id },
    })

    if (!draft) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 })
    }

    // Only the creator or admin can update the draft
    if (!isAdmin(session) && draft.createdById !== session.user.id) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    const updateData: any = {}
    
    if (body !== undefined) {
      updateData.body = body
    }
    
    if (status !== undefined) {
      updateData.status = status
    }
    
    if (metadata !== undefined) {
      const currentMetadata = draft.metadata && typeof draft.metadata === 'object' ? draft.metadata as Record<string, any> : {}
      updateData.metadata = {
        ...currentMetadata,
        ...metadata,
        contentType: contentType || currentMetadata.contentType || 'social-media',
      }
    } else if (contentType !== undefined) {
      const currentMetadata = draft.metadata && typeof draft.metadata === 'object' ? draft.metadata as Record<string, any> : {}
      updateData.metadata = {
        ...currentMetadata,
        contentType: contentType || 'social-media',
      }
    }

    const updatedDraft = await prisma.contentDraft.update({
      where: { id: params.id },
      data: updateData,
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(updatedDraft)
  } catch (error) {
    console.error('Failed to update draft:', error)
    return NextResponse.json(
      { error: 'Failed to update draft' },
      { status: 500 }
    )
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const draft = await prisma.contentDraft.findUnique({
      where: { id: params.id },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
        idea: {
          select: {
            title: true,
            status: true,
          },
        },
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
    })

    if (!draft) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 })
    }

    // Only the creator, admin, or client can view the draft
    if (!isAdmin(session) && draft.createdById !== session.user.id) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    return NextResponse.json(draft)
  } catch (error) {
    console.error('Failed to fetch draft:', error)
    return NextResponse.json(
      { error: 'Failed to fetch draft' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const draft = await prisma.contentDraft.findUnique({
      where: { id: params.id },
    })

    if (!draft) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 })
    }

    // Only the creator or admin can delete the draft
    if (!isAdmin(session) && draft.createdById !== session.user.id) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    await prisma.contentDraft.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete draft:', error)
    return NextResponse.json(
      { error: 'Failed to delete draft' },
      { status: 500 }
    )
  }
} 