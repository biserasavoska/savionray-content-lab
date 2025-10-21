import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions, isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getOrganizationContext } from '@/lib/utils/organization-context'
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

    // Get organization context to verify user has access
    const orgContext = await getOrganizationContext(organizationId, request)
    if (!orgContext) {
      return NextResponse.json(
        { error: 'Organization context required' },
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

    // Get organization users with user details
    const organizationUsers = await prisma.organizationUser.findMany({
      where: {
        organizationId: organizationId,
        isActive: true
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

    logger.info('Organization users fetched', {
      userId: session.user.id,
      userEmail: session.user.email,
      organizationId,
      userCount: organizationUsers.length
    })

    return NextResponse.json({
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      OrganizationUser: organizationUsers
    })

  } catch (error) {
    logger.error('Error fetching organization users', error instanceof Error ? error : new Error(String(error)))
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
