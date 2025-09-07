import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions, isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requireOrganizationContext } from '@/lib/utils/organization-context'
import { logger } from '@/lib/utils/logger'

export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
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

    const { userId } = params
    const body = await request.json()
    const { systemRole } = body

    if (!systemRole) {
      return NextResponse.json(
        { error: 'System role is required' },
        { status: 400 }
      )
    }

    // Validate system role
    const validSystemRoles = ['ADMIN', 'CLIENT', 'CREATIVE']
    if (!validSystemRoles.includes(systemRole)) {
      return NextResponse.json(
        { error: 'Invalid system role' },
        { status: 400 }
      )
    }

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

    // Prevent changing system role of organization owner
    if (organizationUser.role === 'OWNER') {
      return NextResponse.json(
        { error: 'Cannot change system role of organization owner' },
        { status: 403 }
      )
    }

    // Update user system role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: systemRole }
    })

    logger.info('User system role updated', {
      organizationId: orgContext.organizationId,
      userId: userId,
      newSystemRole: systemRole,
      updatedBy: orgContext.userId
    })

    return NextResponse.json({
      message: 'User system role updated successfully',
      user: updatedUser
    })

  } catch (error) {
    logger.error('Error updating user system role', error instanceof Error ? error : new Error(String(error)))
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
