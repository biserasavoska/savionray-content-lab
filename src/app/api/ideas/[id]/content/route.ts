import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { isCreative, isAdmin } from '@/lib/auth'
import { DraftStatus, ContentType } from '@prisma/client'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isCreative(session) && !isAdmin(session)) {
    return NextResponse.json({ error: 'Only creatives and admins can create content' }, { status: 403 })
  }

  try {
    const { body, contentType } = await req.json()

    if (!body) {
      return NextResponse.json({ error: 'Content body is required' }, { status: 400 })
    }

    if (!contentType || !Object.values(ContentType).includes(contentType)) {
      return NextResponse.json({ error: 'Valid content type is required' }, { status: 400 })
    }

    // Check if idea exists and is approved
    const idea = await prisma.idea.findUnique({
      where: {
        id: params.id,
        status: 'APPROVED_BY_CLIENT',
        ...(isCreative(session) ? { createdById: session.user.id } : {}),
      },
    })

    if (!idea) {
      return NextResponse.json({ error: 'Idea not found or not approved' }, { status: 404 })
    }

    if (!isAdmin(session) && idea.createdById !== session.user.id) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Create or update content draft
    const contentDraft = await prisma.contentDraft.create({
      data: {
        body,
        contentType,
        status: DraftStatus.PENDING_FIRST_REVIEW,
        idea: {
          connect: { id: params.id },
        },
        createdBy: {
          connect: { id: session.user.id },
        },
      },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(contentDraft)
  } catch (error) {
    console.error('Failed to save content:', error)
    return NextResponse.json({ error: 'Failed to save content' }, { status: 500 })
  }
} 