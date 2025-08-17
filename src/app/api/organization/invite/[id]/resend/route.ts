import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { prisma } from '@/lib/prisma'
import { authOptions, isAdmin } from '@/lib/auth'
import { requireOrganizationContext } from '@/lib/utils/organization-context'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Find the invitation
    const invitation = await prisma.organizationUser.findUnique({
      where: {
        id: params.id,
        organizationId: orgContext.organizationId
      },
      include: {
        User_OrganizationUser_userIdToUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    if (invitation.joinedAt) {
      return NextResponse.json({ error: 'Invitation has already been accepted' }, { status: 400 })
    }

    // Update the invitation timestamp
    const updatedInvitation = await prisma.organizationUser.update({
      where: { id: params.id },
      data: {
        invitedAt: new Date()
      },
      include: {
        User_OrganizationUser_userIdToUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // TODO: Send invitation email here

    return NextResponse.json({ 
      message: 'Invitation resent successfully',
      invitation: {
        id: updatedInvitation.id,
        email: updatedInvitation.User_OrganizationUser_userIdToUser.email,
        invitedAt: updatedInvitation.invitedAt
      }
    })
  } catch (error) {
    console.error('Failed to resend invitation:', error)
    return NextResponse.json(
      { error: 'Failed to resend invitation' },
      { status: 500 }
    )
  }
}
