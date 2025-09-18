import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getOrganizationContext } from '@/lib/utils/organization-context'

// PATCH /api/drafts/[id]/status - Update draft status with audit trail
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get organization context
    const orgContext = await getOrganizationContext(undefined, request)
    
    if (!orgContext) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    const body = await request.json()
    const { status, revisionNotes, reason } = body

    // Validate status
    const validStatuses = ['DRAFT', 'IN_REVIEW', 'AWAITING_FEEDBACK', 'AWAITING_REVISION', 'APPROVED', 'REJECTED', 'PUBLISHED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Get current draft to check current status
    const currentDraft = await prisma.contentDraft.findUnique({
      where: {
        id: params.id,
        organizationId: orgContext.organizationId
      },
      select: { status: true, metadata: true }
    })

    if (!currentDraft) {
      return NextResponse.json({ error: 'Content draft not found' }, { status: 404 })
    }

    // Update the content draft with audit trail
    const currentMetadata = currentDraft.metadata as any || {}
    const statusHistory = Array.isArray(currentMetadata.statusHistory) ? currentMetadata.statusHistory : []
    
    const updatedDraft = await prisma.contentDraft.update({
      where: {
        id: params.id,
        organizationId: orgContext.organizationId
      },
      data: {
        status,
        metadata: {
          ...currentMetadata,
          ...(revisionNotes && { 
            revisionNotes,
            revisionRequestedBy: session.user.id,
            revisionRequestedAt: new Date().toISOString()
          }),
          statusHistory: [
            ...statusHistory,
            {
              status,
              changedBy: session.user.id,
              changedAt: new Date().toISOString(),
              reason: reason || revisionNotes || 'Status updated',
              previousStatus: currentDraft.status
            }
          ]
        },
        updatedAt: new Date()
      }
    })

    // Log the status change for audit purposes
    console.log(`[AUDIT] Draft ${params.id} status changed from ${currentDraft.status} to ${status} by user ${session.user.email}`)

    return NextResponse.json({
      ...updatedDraft,
      message: `Status updated to ${status} successfully`
    })
  } catch (error) {
    console.error('Error updating draft status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
