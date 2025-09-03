import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'
import { OrganizationContext } from '@/lib/types/security'
import { validateSessionUser } from '@/lib/utils/session-validation'

export async function withOrganizationContext(
  request: NextRequest,
  handler: (req: NextRequest, context: OrganizationContext) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // 🚨 CRITICAL: Use session validation utility to get REAL user ID
    const validation = await validateSessionUser()
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status || 401 }
      )
    }
    
    // Use the REAL user ID from database, not the session ID
    const realUserId = validation.realUserId!
    
    console.log('🔍 DEBUG: Session validation successful in middleware:', {
      sessionUserId: validation.sessionUserId,
      databaseUserId: realUserId,
      userEmail: validation.userEmail,
      userRole: validation.userRole
    })

    // Get user's active organization membership - ✅ Use REAL user ID
    const organizationMembership = await prisma.organizationUser.findFirst({
      where: {
        userId: realUserId,
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
      userId: realUserId,
      userRole: validation.userRole!,
      organizationRole: organizationMembership.role,
      userEmail: validation.userEmail!,
      isSuperAdmin: validation.userRole! === 'SUPER_ADMIN',
      permissions: Array.isArray(organizationMembership.permissions) 
        ? (organizationMembership.permissions as string[]).filter(p => typeof p === 'string')
        : []
    }

    logger.info('Organization context established', {
      userId: realUserId,
      userEmail: validation.userEmail,
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