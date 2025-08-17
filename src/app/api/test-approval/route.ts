import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { prisma } from '@/lib/prisma'
import { authOptions , isClient } from '@/lib/auth'
import { requireOrganizationContext } from '@/lib/utils/organization-context'
import { logger } from '@/lib/utils/logger'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        debug: { hasSession: false, userId: null }
      }, { status: 401 })
    }

    if (!isClient(session)) {
      return NextResponse.json({ 
        error: 'Only clients can test approval',
        debug: { 
          hasSession: true, 
          userId: session.user.id,
          userRole: session.user.role,
          isClient: isClient(session)
        }
      }, { status: 403 })
    }

    const orgContext = await requireOrganizationContext(undefined, req)
    
    // Test idea status update
    const { ideaId, status } = await req.json()
    
    if (!ideaId || !status) {
      return NextResponse.json({ 
        error: 'Missing ideaId or status',
        debug: { ideaId, status }
      }, { status: 400 })
    }

    // Verify the idea exists
    const idea = await prisma.idea.findUnique({
      where: { id: ideaId },
      include: {
        User: true,
      },
    })

    if (!idea) {
      return NextResponse.json({ 
        error: 'Idea not found',
        debug: { ideaId, organizationId: orgContext.organizationId }
      }, { status: 404 })
    }

    // Check if idea belongs to the organization
    if (idea.organizationId !== orgContext.organizationId) {
      return NextResponse.json({ 
        error: 'Idea does not belong to your organization',
        debug: { 
          ideaOrganizationId: idea.organizationId,
          userOrganizationId: orgContext.organizationId
        }
      }, { status: 403 })
    }

    // Update the idea status
    const updatedIdea = await prisma.idea.update({
      where: { id: ideaId },
      data: { status },
    })

    logger.info('Test approval successful', {
      ideaId,
      oldStatus: idea.status,
      newStatus: status,
      userId: session.user.id,
      organizationId: orgContext.organizationId
    })

    return NextResponse.json({
      success: true,
      idea: updatedIdea,
      debug: {
        userId: session.user.id,
        userRole: session.user.role,
        organizationId: orgContext.organizationId,
        oldStatus: idea.status,
        newStatus: status
      }
    })

  } catch (error) {
    logger.error('Test approval failed', error instanceof Error ? error : new Error(String(error)))
    return NextResponse.json({
      error: 'Failed to test approval',
      debug: { error: error instanceof Error ? error.message : String(error) }
    }, { status: 500 })
  }
} 