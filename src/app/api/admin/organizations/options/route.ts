import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions, isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Only admins can view all organizations
    if (!isAdmin(session)) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Get all organizations with minimal data for dropdown
    const organizations = await prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        primaryColor: true,
        subscriptionStatus: true,
        _count: {
          select: {
            OrganizationUser: {
              where: { isActive: true }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    // Transform data for dropdown
    const organizationOptions = organizations.map(org => ({
      id: org.id,
      name: org.name,
      slug: org.slug,
      primaryColor: org.primaryColor,
      subscriptionStatus: org.subscriptionStatus,
      userCount: org._count.OrganizationUser
    }))

    logger.info('Organization options fetched for admin', {
      adminId: session.user.id,
      adminEmail: session.user.email,
      organizationCount: organizationOptions.length
    })

    return NextResponse.json({
      organizations: organizationOptions
    })

  } catch (error) {
    logger.error('Error fetching organization options', error instanceof Error ? error : new Error(String(error)))
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
