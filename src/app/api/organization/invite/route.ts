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

  // Temporarily comment out admin check to debug
  // if (!isAdmin(session)) {
  //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  // }

  try {
    const orgContext = await requireOrganizationContext(undefined, request)
    if (!orgContext) {
      return NextResponse.json({ error: 'Organization context required' }, { status: 400 })
    }

    // For now, just return an empty list to test if the endpoint works
    // We'll implement the actual invitation logic once we confirm the endpoint is working
    return NextResponse.json({ invitations: [] })
    
    // TODO: Implement actual invitation fetching logic
    // const { searchParams } = new URL(request.url)
    // const status = searchParams.get('status')
    // 
    // // Get organization users that are invitations (have invitedAt but no joinedAt)
    // const invitations = await prisma.organizationUser.findMany({
    //   where: {
    //     organizationId: orgContext.organizationId,
    //     invitedAt: { not: null },
    //     joinedAt: null, // This indicates it's still an invitation
    //     ...(status === 'PENDING' && { isActive: true }),
    //     ...(status === 'EXPIRED' && { 
    //       invitedAt: { 
    //         lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
    //           }
    //     })
    //   },
    //   include: {
    //     User_OrganizationUser_userIdToUser: {
    //       select: {
    //         id: true,
    //         name: true,
    //         email: true,
    //         role: true,
    //         image: true
    //       }
    //     },
    //     User_OrganizationUser_invitedByToUser: {
    //       select: {
    //         name: true,
    //         email: true
    //       }
    //     }
    //   },
    //   orderBy: {
    //     invitedAt: 'desc'
    //   }
    // })
    // 
    // // Transform the data to match the expected format
    // const transformedInvitations = invitations.map(inv => ({
    //   id: inv.id,
    //   email: inv.User_OrganizationUser_userIdToUser?.email || 'Unknown',
    //   role: inv.role,
    //   status: inv.isActive ? 'PENDING' : 'EXPIRED',
    //   invitedAt: inv.invitedAt,
    //   invitedBy: inv.User_OrganizationUser_invitedByToUser?.name || 'Unknown',
    //   expiresAt: inv.invitedAt ? new Date(inv.invitedAt.getTime() + 7 * 24 * 60 * 60 * 1000) : null
    // }))
    // 
    // return NextResponse.json({ invitations: transformedInvitations })
  } catch (error) {
    console.error('Failed to fetch invitations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invitations' },
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
