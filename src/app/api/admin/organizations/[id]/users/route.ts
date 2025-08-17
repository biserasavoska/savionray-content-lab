import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions , isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'

export async function GET(
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

    const organizationId = params.id

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

    // Get organization users with user details
    const organizationUsers = await prisma.organizationUser.findMany({
      where: {
        organizationId: organizationId
      },
      include: {
        User_OrganizationUser_userIdToUser: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            image: true
          }
        }
      },
      orderBy: {
        joinedAt: 'desc'
      }
    })

    // Transform data for frontend
    const users = organizationUsers.map((orgUser: any) => ({
      id: orgUser.User_OrganizationUser_userIdToUser.id,
      name: orgUser.User_OrganizationUser_userIdToUser.name || 'Unknown',
      email: orgUser.User_OrganizationUser_userIdToUser.email || '',
      role: orgUser.User_OrganizationUser_userIdToUser.role,
      organizationRole: orgUser.role,
      joinedAt: orgUser.joinedAt?.toISOString() || new Date().toISOString(),
      isActive: orgUser.isActive,
      permissions: orgUser.permissions
    }))

    logger.info('Organization users fetched by admin', {
      adminId: session.user.id,
      adminEmail: session.user.email,
      organizationId,
      userCount: users.length
    })

    return NextResponse.json({
      users,
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug
      }
    })

  } catch (error) {
    logger.error('Error fetching organization users', error instanceof Error ? error : new Error(String(error)))
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 