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

export async function POST(
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
    const body = await request.json()
    const { name, email, systemRole, organizationRole } = body

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
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

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          name,
          role: systemRole || 'CLIENT',
          emailVerified: new Date()
        }
      })
    } else {
      // Update existing user's name if provided
      if (name && user.name !== name) {
        await prisma.user.update({
          where: { id: user.id },
          data: { name }
        })
      }
    }

    // Check if user is already in this organization
    const existingMembership = await prisma.organizationUser.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId: user.id
        }
      }
    })

    if (existingMembership) {
      return NextResponse.json(
        { error: 'User is already a member of this organization' },
        { status: 409 }
      )
    }

    // Add user to organization
    const organizationUserData: any = {
      organizationId,
      userId: user.id,
      role: organizationRole || 'MEMBER',
      permissions: getPermissionsForRole(organizationRole || 'MEMBER'),
      isActive: true,
      joinedAt: new Date()
    }

    // TEMPORARILY DISABLE invitedBy to prevent foreign key constraint issues
    // TODO: Re-enable once database schema is properly aligned
    // if (session.user?.id) {
    //   organizationUserData.invitedBy = session.user.id
    // }

    await prisma.organizationUser.create({
      data: organizationUserData
    })

    logger.info('User added to organization by admin', {
      adminId: session.user?.id || 'unknown',
      adminEmail: session.user?.email || 'unknown',
      organizationId,
      userId: user.id,
      userEmail: user.email,
      organizationRole: organizationRole || 'MEMBER',
      invitedBy: 'temporarily_disabled_due_to_constraint_issues'
    })

    return NextResponse.json({
      message: 'User added successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationRole: organizationRole || 'MEMBER'
      }
    })

  } catch (error) {
    logger.error('Error adding user to organization', error instanceof Error ? error : new Error(String(error)))
    
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