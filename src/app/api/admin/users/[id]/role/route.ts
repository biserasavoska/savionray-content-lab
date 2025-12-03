import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateAdminSessionUser } from '@/lib/utils/session-validation'
import { logger } from '@/lib/utils/logger'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate admin session
    const validation = await validateAdminSessionUser()

    if (!validation.success) {
      logger.warn('Unauthorized attempt to update user role', {
        error: validation.error,
        status: validation.status,
        targetUserId: params.id
      })
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status || 401 }
      )
    }

    const body = await request.json()
    const { role } = body

    if (!role) {
      return NextResponse.json(
        { error: 'Role is required' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles = ['ADMIN', 'CREATIVE', 'CLIENT']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be ADMIN, CREATIVE, or CLIENT' },
        { status: 400 }
      )
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, email: true, name: true, role: true, isSuperAdmin: true }
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Prevent changing own role
    if (targetUser.id === validation.realUserId) {
      return NextResponse.json(
        { error: 'Cannot change your own role' },
        { status: 403 }
      )
    }

    // Prevent changing super admin role (additional safety check)
    if (targetUser.isSuperAdmin && role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Cannot change role of super admin' },
        { status: 403 }
      )
    }

    // Update the user's role
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: { role: role as any },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        isSuperAdmin: true
      }
    })

    logger.info('User role updated by admin', {
      adminId: validation.realUserId,
      adminEmail: validation.userEmail,
      targetUserId: targetUser.id,
      targetUserEmail: targetUser.email,
      targetUserName: targetUser.name,
      oldRole: targetUser.role,
      newRole: role
    })

    return NextResponse.json({
      message: 'User role updated successfully',
      user: updatedUser
    })

  } catch (error) {
    logger.error('Error updating user role', error instanceof Error ? error : new Error(String(error)), {
      targetUserId: params.id,
      timestamp: new Date().toISOString()
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

