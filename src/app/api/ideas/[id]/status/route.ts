import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { prisma } from '@/lib/prisma'
import { authOptions , isClient } from '@/lib/auth'
import { IDEA_STATUS, DRAFT_STATUS, CONTENT_TYPE } from '@/lib/utils/enum-constants'
import { requireOrganizationContext } from '@/lib/utils/organization-context'
import { logger } from '@/lib/utils/logger'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
      logger.warn('Unauthorized attempt to update idea status', { ideaId: params.id })
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isClient(session)) {
      logger.warn('Non-client attempt to update idea status', { 
        ideaId: params.id, 
        userId: session.user.id, 
        userRole: session.user.role 
      })
    return NextResponse.json({ error: 'Only clients can update idea status' }, { status: 403 })
  }

    const orgContext = await requireOrganizationContext()
    const { status } = await req.json()

    logger.info('Attempting to update idea status', {
      ideaId: params.id,
      newStatus: status,
      userId: session.user.id,
      organizationId: orgContext.organizationId
    })

    // Verify the idea exists
    const idea = await prisma.idea.findUnique({
      where: { id: params.id },
      include: {
        createdBy: true,
      },
    })

    if (!idea) {
      logger.warn('Idea not found for status update', { 
        ideaId: params.id, 
        organizationId: orgContext.organizationId 
      })
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 })
    }

    // Check if idea belongs to the organization
    if (idea.organizationId !== orgContext.organizationId) {
      logger.warn('Idea does not belong to user organization', {
        ideaId: params.id,
        ideaOrganizationId: idea.organizationId,
        userOrganizationId: orgContext.organizationId
      })
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 })
    }

    // Validate status transitions
    if (idea.status === IDEA_STATUS.PENDING) {
      // Allow status updates from PENDING
    } else {
      logger.warn('Invalid status transition attempted', {
        ideaId: params.id,
        currentStatus: idea.status,
        attemptedStatus: status
      })
      return NextResponse.json(
        { error: 'Invalid status transition from PENDING' },
        { status: 400 }
      )
    }

    if (status !== IDEA_STATUS.APPROVED && status !== IDEA_STATUS.REJECTED) {
      logger.warn('Invalid status value provided', {
        ideaId: params.id,
        providedStatus: status,
        validStatuses: [IDEA_STATUS.APPROVED, IDEA_STATUS.REJECTED]
      })
      return NextResponse.json(
        { error: 'Invalid status transition from PENDING' },
        { status: 400 }
      )
    }

    // Use a transaction to update the idea and potentially create a content draft
    const result = await prisma.$transaction(async (tx: any) => {
      const updatedIdea = await tx.idea.update({
        where: { id: params.id },
        data: { status },
      })

      // If the idea was just approved and there are no existing content drafts, create one
      if (status === IDEA_STATUS.APPROVED && idea.status !== IDEA_STATUS.APPROVED) {
        const existingDrafts = await tx.contentDraft.findMany({
          where: { ideaId: params.id }
        })

        if (existingDrafts.length === 0) {
          await tx.contentDraft.create({
            data: {
              ideaId: params.id,
              status: DRAFT_STATUS.DRAFT,
              contentType: idea.contentType || CONTENT_TYPE.SOCIAL_MEDIA_POST,
              body: `Content draft for: ${idea.title}\n\n${idea.description}`,
              createdById: idea.createdById,
              organizationId: orgContext.organizationId,
              metadata: {
                autoGenerated: true,
                ideaTitle: idea.title,
                ideaDescription: idea.description,
                contentType: idea.contentType || CONTENT_TYPE.SOCIAL_MEDIA_POST
              }
            }
          })
          
          logger.info('Created auto-generated content draft for approved idea', {
            ideaId: params.id,
            draftId: params.id,
            organizationId: orgContext.organizationId
          })
        }
      }

      return updatedIdea
    })

    logger.info('Successfully updated idea status', {
      ideaId: params.id,
      oldStatus: idea.status,
      newStatus: status,
      userId: session.user.id,
      organizationId: orgContext.organizationId
    })

    return NextResponse.json(result)
  } catch (error) {
    logger.error('Error updating idea status', error instanceof Error ? error : new Error(String(error)), {
      ideaId: params.id
    })
    return NextResponse.json(
      { error: 'Failed to update idea status' },
      { status: 500 }
    )
  }
} 