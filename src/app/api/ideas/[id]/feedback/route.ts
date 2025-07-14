import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { prisma } from '@/lib/prisma'
import { authOptions , isClient, isAdmin } from '@/lib/auth'
import { CONTENT_TYPE, DRAFT_STATUS } from '@/lib/utils/enum-constants'
import { requireOrganizationContext } from '@/lib/utils/organization-context'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isClient(session) && !isAdmin(session)) {
    return NextResponse.json({ error: 'Only clients and admins can provide feedback' }, { status: 403 })
  }

  try {
    const orgContext = await requireOrganizationContext()
    const { comment } = await req.json()

    if (!comment) {
      return NextResponse.json({ error: 'Comment is required' }, { status: 400 })
    }

    const idea = await prisma.idea.findUnique({
      where: { id: params.id },
    })

    if (!idea) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 })
    }

    // First create the content draft
    const contentDraft = await prisma.contentDraft.create({
      data: {
        body: '',
        contentType: CONTENT_TYPE.SOCIAL_MEDIA_POST,
        status: DRAFT_STATUS.DRAFT,
        ideaId: params.id,
        createdById: session.user.id,
        organizationId: orgContext.organizationId,
      },
    })

    // Then create the feedback
    const feedback = await prisma.feedback.create({
      data: {
        comment,
        contentDraftId: contentDraft.id,
        createdById: session.user.id,
      },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
        contentDraft: {
          include: {
            createdBy: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(feedback)
  } catch (error) {
    console.error('Failed to create feedback:', error)
    return NextResponse.json({ error: 'Failed to create feedback' }, { status: 500 })
  }
} 