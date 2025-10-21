import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions, isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'
import { getOrganizationContext } from '@/lib/utils/organization-context'

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

    // Use getOrganizationContext to validate access to the specified organization
    const orgContext = await getOrganizationContext(organizationId, request)

    if (!orgContext || orgContext.organizationId !== organizationId) {
      return NextResponse.json(
        { error: 'Organization context required or access denied' },
        { status: 400 }
      )
    }

    // Get organization with users
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        OrganizationUser: {
          where: { isActive: true },
          include: {
            User_OrganizationUser_userIdToUser: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                image: true,
              }
            }
          },
          orderBy: { joinedAt: 'desc' }
        }
      }
    })

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    logger.info('Organization data fetched', {
      userId: session.user.id,
      userEmail: session.user.email,
      organizationId,
    })

    return NextResponse.json({
      organization
    })
  } catch (error) {
    logger.error(
      'Error fetching organization data:',
      error instanceof Error ? error : new Error(String(error))
    )

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
