import { NextRequest, NextResponse } from 'next/server'
import { validateAdminSessionUser } from '@/lib/utils/session-validation'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    const validation = await validateAdminSessionUser()
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status || 401 }
      )
    }
    
    const realUserId = validation.realUserId!
    const userEmail = validation.userEmail

    const organizationId = params.id
    const userId = params.userId

    // Verify organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId }
    })

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    // Verify user exists in organization
    const organizationUser = await prisma.organizationUser.findFirst({
      where: {
        organizationId: organizationId,
        userId: userId
      },
      include: {
        User_OrganizationUser_userIdToUser: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (!organizationUser) {
      return NextResponse.json(
        { error: 'User not found in organization' },
        { status: 404 }
      )
    }

    // Prevent deactivating the last owner
    if (organizationUser.role === 'OWNER') {
      const ownerCount = await prisma.organizationUser.count({
        where: {
          organizationId: organizationId,
          role: 'OWNER',
          isActive: true
        }
      })

      if (ownerCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot deactivate the last owner of the organization' },
          { status: 400 }
        )
      }
    }

    // Deactivate user
    const updatedUser = await prisma.organizationUser.update({
      where: {
        id: organizationUser.id
      },
      data: {
        isActive: false
      },
      include: {
        User_OrganizationUser_userIdToUser: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    logger.info('User deactivated by admin', {
      adminId: realUserId,
      adminEmail: userEmail,
      organizationId,
      userId,
      userName: updatedUser.User_OrganizationUser_userIdToUser.name,
      userEmail: updatedUser.User_OrganizationUser_userIdToUser.email
    })

    return NextResponse.json({
      message: 'User deactivated successfully',
      user: {
        id: userId,
        name: updatedUser.User_OrganizationUser_userIdToUser.name,
        email: updatedUser.User_OrganizationUser_userIdToUser.email,
        isActive: false
      }
    })

  } catch (error) {
    logger.error('Error deactivating user', error instanceof Error ? error : new Error(String(error)))
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 