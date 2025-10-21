import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions, isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
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

    const { userId } = params
    const { role } = await request.json()

    if (!role || !['ADMIN', 'CREATIVE', 'CLIENT'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be ADMIN, CREATIVE, or CLIENT' },
        { status: 400 }
      )
    }

    // Prevent admin from changing their own role
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot change your own role' },
        { status: 403 }
      )
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    })

    logger.info('User role updated globally', {
      adminId: session.user.id,
      adminEmail: session.user.email,
      targetUserId: userId,
      targetUserEmail: updatedUser.email,
      newRole: role
    })

    return NextResponse.json({
      message: 'User role updated successfully',
      user: updatedUser
    })

  } catch (error) {
    logger.error('Error updating user role globally', error instanceof Error ? error : new Error(String(error)))
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
