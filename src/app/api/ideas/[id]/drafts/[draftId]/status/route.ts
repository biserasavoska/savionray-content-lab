import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { DRAFT_STATUS } from '@/lib/utils/enum-constants'
import { isClient } from '@/lib/auth'
import { requireOrganizationContext } from '@/lib/utils/organization-context'
import { logger } from '@/lib/utils/logger'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; draftId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      logger.warn('Unauthorized attempt to update draft status', { 
        ideaId: params.id, 
        draftId: params.draftId 
      })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isClient(session)) {
      logger.warn('Non-client attempt to update draft status', { 
        ideaId: params.id, 
        draftId: params.draftId,
        userId: session.user.id, 
        userRole: session.user.role 
      })
      return NextResponse.json({ error: 'Only clients can update draft status' }, { status: 403 })
    }

    const orgContext = await requireOrganizationContext()
    const { status } = await req.json()

    logger.info('Attempting to update draft status', {
      ideaId: params.id,
      draftId: params.draftId,
      newStatus: status,
      userId: session.user.id,
      organizationId: orgContext.organizationId
    })

    // Verify the draft exists
    const draft = await prisma.contentDraft.findUnique({
      where: { id: params.draftId },
      include: {
        idea: true,
        createdBy: true,
      },
    })

    if (!draft) {
      logger.warn('Draft not found for status update', { 
        ideaId: params.id, 
        draftId: params.draftId,
        organizationId: orgContext.organizationId 
      })
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 })
    }

    // Check if draft belongs to the organization
    if (draft.organizationId !== orgContext.organizationId) {
      logger.warn('Draft does not belong to user organization', {
        ideaId: params.id,
        draftId: params.draftId,
        draftOrganizationId: draft.organizationId,
        userOrganizationId: orgContext.organizationId
      })
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 })
    }

    // Check if draft belongs to the specified idea
    if (draft.ideaId !== params.id) {
      logger.warn('Draft does not belong to specified idea', {
        ideaId: params.id,
        draftId: params.draftId,
        draftIdeaId: draft.ideaId
      })
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 })
    }

    // Validate status transitions
    const validStatuses = [DRAFT_STATUS.DRAFT, DRAFT_STATUS.AWAITING_FEEDBACK, DRAFT_STATUS.AWAITING_REVISION, DRAFT_STATUS.APPROVED, DRAFT_STATUS.REJECTED, DRAFT_STATUS.PUBLISHED]
    if (!validStatuses.includes(status)) {
      logger.warn('Invalid draft status provided', {
        ideaId: params.id,
        draftId: params.draftId,
        providedStatus: status,
        validStatuses
      })
      return NextResponse.json(
        { error: 'Invalid draft status' },
        { status: 400 }
      )
    }

    // Update the draft status
    const updatedDraft = await prisma.contentDraft.update({
      where: { id: params.draftId },
      data: { status },
    })

    logger.info('Successfully updated draft status', {
      ideaId: params.id,
      draftId: params.draftId,
      oldStatus: draft.status,
      newStatus: status,
      userId: session.user.id,
      organizationId: orgContext.organizationId
    })

    return NextResponse.json(updatedDraft)
  } catch (error) {
    logger.error('Error updating draft status', error instanceof Error ? error : new Error(String(error)), {
      ideaId: params.id,
      draftId: params.draftId
    })
    return NextResponse.json(
      { error: 'Failed to update draft status' },
      { status: 500 }
    )
  }
} 