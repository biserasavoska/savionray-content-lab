import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdmin } from '@/lib/auth'
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

    const orgContext = await requireOrganizationContext()
    if (!orgContext) {
      return NextResponse.json(
        { error: 'Organization context required' },
        { status: 400 }
      )
    }

    const { userId } = params
    const body = await request.json()
    const { role } = body

    if (!role) {
      return NextResponse.json(
        { error: 'Role is required' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles = ['OWNER', 'ADMIN', 'MANAGER', 'MEMBER', 'VIEWER']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
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

    // Prevent changing owner role unless it's the current user
    if (organizationUser.role === 'OWNER' && userId !== orgContext.userId) {
      return NextResponse.json(
        { error: 'Cannot change owner role' },
        { status: 403 }
      )
    }

    // Update user role
    const updatedUser = await prisma.organizationUser.update({
      where: { id: organizationUser.id },
      data: { role }
    })

    logger.info('User role updated in organization', {
      organizationId: orgContext.organizationId,
      userId: userId,
      newRole: role,
      updatedBy: orgContext.userId
    })

    return NextResponse.json({
      message: 'User role updated successfully',
      user: updatedUser
    })

  } catch (error) {
    logger.error('Error updating user role', error instanceof Error ? error : new Error(String(error)))
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 