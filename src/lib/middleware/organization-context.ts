import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'
import { OrganizationContext } from '@/lib/types/security'

export async function withOrganizationContext(
  request: NextRequest,
  handler: (req: NextRequest, context: OrganizationContext) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user's active organization membership
    const organizationMembership = await prisma.organizationUser.findFirst({
      where: {
        userId: session.user.id,
        isActive: true
      },
      include: {
        organization: true
      },
      orderBy: {
        joinedAt: 'desc'
      }
    })

    if (!organizationMembership) {
      return NextResponse.json(
        { error: 'No active organization found' },
        { status: 403 }
      )
    }

    const context: OrganizationContext = {
      organizationId: organizationMembership.organizationId,
      userId: session.user.id,
      userRole: session.user.role,
      organizationRole: organizationMembership.role,
      userEmail: session.user.email || '',
      isSuperAdmin: session.user.isSuperAdmin || false,
      permissions: Array.isArray(organizationMembership.permissions) 
        ? (organizationMembership.permissions as string[]).filter(p => typeof p === 'string')
        : []
    }

    logger.info('Organization context established', {
      userId: session.user.id,
      userEmail: session.user.email,
      organizationId: context.organizationId,
      organizationName: organizationMembership.organization.name,
      userRole: context.userRole
    })

    return await handler(request, context)
  } catch (error) {
    logger.error('Error establishing organization context', error instanceof Error ? error : new Error(String(error)))
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 