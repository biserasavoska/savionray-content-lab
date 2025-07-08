import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'

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

    const invitationId = params.id

    // Get invitation
    const invitation = await prisma.organizationInvitation.findUnique({
      where: { id: invitationId },
      include: {
        organization: true
      }
    })

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      )
    }

    // Check if invitation is expired
    if (invitation.expiresAt < new Date()) {
      await prisma.organizationInvitation.update({
        where: { id: invitationId },
        data: { status: 'EXPIRED' }
      })
      
      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 400 }
      )
    }

    // Check if invitation is already accepted/declined
    if (invitation.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Invitation has already been processed' },
        { status: 400 }
      )
    }

    // Check if user email matches invitation email
    if (session.user.email !== invitation.email) {
      return NextResponse.json(
        { error: 'This invitation is not for your email address' },
        { status: 403 }
      )
    }

    // Check if user is already in the organization
    const existingMembership = await prisma.organizationUser.findUnique({
      where: {
        organizationId_userId: {
          organizationId: invitation.organizationId,
          userId: session.user.id
        }
      }
    })

    if (existingMembership) {
      // Update invitation status to accepted
      await prisma.organizationInvitation.update({
        where: { id: invitationId },
        data: { status: 'ACCEPTED' }
      })

      return NextResponse.json({
        message: 'You are already a member of this organization',
        organizationId: invitation.organizationId
      })
    }

    // Add user to organization
    await prisma.organizationUser.create({
      data: {
        organizationId: invitation.organizationId,
        userId: session.user.id,
        role: invitation.role,
        invitedBy: invitation.invitedBy,
        joinedAt: new Date()
      }
    })

    // Update invitation status
    await prisma.organizationInvitation.update({
      where: { id: invitationId },
      data: { status: 'ACCEPTED' }
    })

    logger.info('User accepted organization invitation', {
      invitationId,
      organizationId: invitation.organizationId,
      organizationName: invitation.organization.name,
      userId: session.user.id,
      userEmail: session.user.email
    })

    return NextResponse.json({
      message: 'Successfully joined organization',
      organizationId: invitation.organizationId,
      organizationName: invitation.organization.name
    })

  } catch (error) {
    logger.error('Error accepting invitation', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 