import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions , isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requireOrganizationContext } from '@/lib/utils/organization-context'
import { logger } from '@/lib/utils/logger'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (!isAdmin(session)) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const orgContext = await requireOrganizationContext(undefined, request)
    if (!orgContext) {
      return NextResponse.json(
        { error: 'Organization context required' },
        { status: 400 }
      )
    }

    const userId = params.id

    // Check if user exists in organization
    const organizationUser = await prisma.organizationUser.findFirst({
      where: {
        userId: userId,
        organizationId: orgContext.organizationId,
        isActive: true
      }
    })

    if (!organizationUser) {
      return NextResponse.json(
        { error: 'User not found in organization' },
        { status: 404 }
      )
    }

    // Prevent removing owner
    if (organizationUser.role === 'OWNER') {
      return NextResponse.json(
        { error: 'Cannot remove organization owner' },
        { status: 403 }
      )
    }

    // Prevent removing yourself
    if (userId === orgContext.userId) {
      return NextResponse.json(
        { error: 'Cannot remove yourself from organization' },
        { status: 403 }
      )
    }

    // Deactivate user in organization (soft delete)
    const updatedUser = await prisma.organizationUser.update({
      where: { id: organizationUser.id },
      data: { 
        isActive: false,
        joinedAt: null // Clear join date
      }
    })

    logger.info('User removed from organization', {
      organizationId: orgContext.organizationId,
      userId: userId,
      removedBy: orgContext.userId
    })

    return NextResponse.json({
      message: 'User removed from organization successfully',
      user: updatedUser
    })

  } catch (error) {
    logger.error('Error removing user from organization', error instanceof Error ? error : new Error(String(error)))
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 