import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions , isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; userId: string } }
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

    const organizationId = params.id
    const userId = params.userId
    const { role } = await request.json()

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
        user: {
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

    // Update user role
    const updatedUser = await prisma.organizationUser.update({
      where: {
        id: organizationUser.id
      },
      data: {
        role: role as any,
        permissions: getPermissionsForRole(role)
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    logger.info('User role updated by admin', {
      adminId: session.user.id,
      adminEmail: session.user.email,
      organizationId,
      userId,
      oldRole: organizationUser.role,
      newRole: role,
      userName: updatedUser.user.name,
      userEmail: updatedUser.user.email
    })

    return NextResponse.json({
      message: 'User role updated successfully',
      user: {
        id: userId,
        name: updatedUser.user.name,
        email: updatedUser.user.email,
        organizationRole: updatedUser.role
      }
    })

  } catch (error) {
    logger.error('Error updating user role', error instanceof Error ? error : new Error(String(error)))
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to get permissions for organization roles
function getPermissionsForRole(role: string): string[] {
  switch (role) {
    case 'OWNER':
      return ['ALL']
    case 'ADMIN':
      return ['APPROVE_IDEAS', 'VIEW_ALL_CONTENT', 'MANAGE_PLANS', 'MANAGE_USERS', 'MANAGE_SETTINGS']
    case 'MANAGER':
      return ['CREATE_CONTENT', 'VIEW_ALL', 'MANAGE_WORKFLOWS', 'APPROVE_CONTENT']
    case 'MEMBER':
      return ['CREATE_CONTENT', 'VIEW_OWN_CONTENT', 'SUBMIT_FOR_REVIEW']
    case 'VIEWER':
      return ['VIEW_ALL_CONTENT']
    default:
      return ['VIEW_OWN_CONTENT']
  }
} 