import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateAdminSessionUser } from '@/lib/utils/session-validation'
import { logger } from '@/lib/utils/logger'
import bcrypt from 'bcryptjs'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate admin session
    const validation = await validateAdminSessionUser()

    if (!validation.success) {
      logger.warn('Unauthorized attempt to reset user password', {
        error: validation.error,
        status: validation.status,
        targetUserId: params.id
      })
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status || 401 }
      )
    }

    const { newPassword } = await request.json()

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, email: true, name: true, role: true }
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Update the user's password
    await prisma.user.update({
      where: { id: params.id },
      data: { password: hashedPassword }
    })

    logger.info('User password reset by admin', {
      adminId: validation.realUserId,
      adminEmail: validation.userEmail,
      targetUserId: targetUser.id,
      targetUserEmail: targetUser.email,
      targetUserName: targetUser.name,
      targetUserRole: targetUser.role
    })

    return NextResponse.json({
      message: 'Password reset successfully',
      user: {
        id: targetUser.id,
        email: targetUser.email,
        name: targetUser.name,
        role: targetUser.role
      }
    })

  } catch (error) {
    logger.error('Error resetting user password', error instanceof Error ? error : new Error(String(error)), {
      targetUserId: params.id,
      timestamp: new Date().toISOString()
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
