import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { prisma } from '@/lib/prisma'
import { authOptions, isAdmin } from '@/lib/auth'
import { requireOrganizationContext } from '@/lib/utils/organization-context'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Re-enable admin check for security
  if (!isAdmin(session)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const orgContext = await requireOrganizationContext(undefined, request)
    if (!orgContext) {
      return NextResponse.json({ error: 'Organization context required' }, { status: 400 })
    }

    // Get the status filter from query params
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    // Build the where clause
    const where: any = {
      organizationId: orgContext.organizationId,
    }

    // Filter by status if provided
    if (status === 'PENDING') {
      where.isActive = true
      where.joinedAt = null
      where.invitedAt = { not: null }
    } else if (status === 'ACTIVE') {
      where.isActive = true
      where.joinedAt = { not: null }
    } else if (status === 'INACTIVE') {
      where.isActive = false
    }

    // Fetch organization users that match the criteria
    const invitations = await prisma.organizationUser.findMany({
      where,
      include: {
        User_OrganizationUser_userIdToUser: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { invitedAt: 'desc' },
    })

    // Transform the data to match what the frontend expects
    const transformedInvitations = invitations.map((invitation: any) => ({
      id: invitation.id,
      email: invitation.User_OrganizationUser_userIdToUser.email,
      name: invitation.User_OrganizationUser_userIdToUser.name,
      role: invitation.role,
      status: invitation.joinedAt ? 'ACTIVE' : 'PENDING',
      invitedAt: invitation.invitedAt,
      joinedAt: invitation.joinedAt,
      isActive: invitation.isActive,
    }))

    return NextResponse.json({ invitations: transformedInvitations })
  } catch (error) {
    console.error('Error fetching invitations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isAdmin(session)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const orgContext = await requireOrganizationContext(undefined, request)
    if (!orgContext) {
      return NextResponse.json({ error: 'Organization context required' }, { status: 400 })
    }

    const { email, role } = await request.json()

    if (!email || !role) {
      return NextResponse.json({ error: 'Email and role are required' }, { status: 400 })
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // Create a new user account
      user = await prisma.user.create({
        data: {
          email,
          name: email.split('@')[0], // Use email prefix as name
          role: 'CLIENT', // Default role
          password: '', // Will be set when they accept invitation
          isSuperAdmin: false
        }
      })
    }

    // Check if user is already in this organization
    const existingMembership = await prisma.organizationUser.findUnique({
      where: {
        organizationId_userId: {
          organizationId: orgContext.organizationId,
          userId: user.id
        }
      }
    })

    if (existingMembership) {
      return NextResponse.json({ error: 'User is already a member of this organization' }, { status: 400 })
    }

    // Create the invitation (OrganizationUser with invitedAt but no joinedAt)
    const invitation = await prisma.organizationUser.create({
      data: {
        organizationId: orgContext.organizationId,
        userId: user.id,
        role,
        isActive: true,
        invitedBy: session.user.id,
        invitedAt: new Date(),
        joinedAt: null
      },
      include: {
        User_OrganizationUser_userIdToUser: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    })

    // TODO: Send invitation email here

    return NextResponse.json({ 
      message: 'Invitation sent successfully',
      invitation: {
        id: invitation.id,
        email: invitation.User_OrganizationUser_userIdToUser.email,
        role: invitation.role,
        status: 'PENDING',
        invitedAt: invitation.invitedAt
      }
    })
  } catch (error) {
    console.error('Failed to send invitation:', error)
    return NextResponse.json(
      { error: 'Failed to send invitation' },
      { status: 500 }
    )
  }
}
