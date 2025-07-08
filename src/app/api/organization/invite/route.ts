import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requireOrganizationContext } from '@/lib/utils/organization-context'
import { logger } from '@/lib/utils/logger'
import { sendInvitationEmail } from '@/lib/actions/email'

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { 
      email, 
      name, 
      role = 'MEMBER',
      systemRole = 'CLIENT',
      message = ''
    } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
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

    // Get organization details
    const organization = await prisma.organization.findUnique({
      where: { id: orgContext.organizationId }
    })

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    // Check if user already exists in organization
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: {
        organizations: {
          where: { 
            organizationId: orgContext.organizationId,
            isActive: true
          }
        }
      }
    })

    if (existingUser && existingUser.organizations.length > 0) {
      return NextResponse.json(
        { error: 'User is already a member of this organization' },
        { status: 409 }
      )
    }

    // Create or find user
    let user = existingUser

    if (!user) {
      // Create new user
      const newUser = await prisma.user.create({
        data: {
          email,
          name: name || email.split('@')[0],
          role: systemRole as any,
          emailVerified: new Date() // Auto-verify for now
        }
      })
      user = newUser
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Failed to create or find user' },
        { status: 500 }
      )
    }

    // Create organization invitation
    const invitation = await prisma.organizationInvitation.create({
      data: {
        organizationId: orgContext.organizationId,
        email: user.email!,
        role: role as any,
        invitedBy: orgContext.userId,
        message: message || `You've been invited to join ${organization.name}`,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        status: 'PENDING'
      }
    })

    // Send invitation email
    try {
      await sendInvitationEmail({
        to: user.email!,
        organizationName: organization.name,
        inviterName: session.user.name || 'Admin',
        invitationLink: `${process.env.NEXTAUTH_URL}/invite/${invitation.id}`,
        message: message
      })
    } catch (emailError) {
      logger.error('Failed to send invitation email', emailError)
      // Don't fail the request if email fails
    }

    logger.info('User invited to organization', {
      organizationId: orgContext.organizationId,
      organizationName: organization.name,
      userId: user.id,
      userEmail: email,
      role,
      invitedBy: orgContext.userId
    })

    return NextResponse.json({
      message: 'Invitation sent successfully',
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        status: invitation.status,
        expiresAt: invitation.expiresAt
      }
    })

  } catch (error) {
    logger.error('Error inviting user to organization', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const orgContext = await requireOrganizationContext()
    if (!orgContext) {
      return NextResponse.json(
        { error: 'Organization context required' },
        { status: 400 }
      )
    }

    const url = new URL(request.url)
    const status = url.searchParams.get('status') || 'PENDING'
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const [invitations, total] = await Promise.all([
      prisma.organizationInvitation.findMany({
        where: {
          organizationId: orgContext.organizationId,
          status: status as any
        },
        include: {
          invitedByUser: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.organizationInvitation.count({
        where: {
          organizationId: orgContext.organizationId,
          status: status as any
        }
      })
    ])

    return NextResponse.json({
      invitations,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit
      }
    })

  } catch (error) {
    logger.error('Error fetching invitations', error instanceof Error ? error : new Error(String(error)))
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 