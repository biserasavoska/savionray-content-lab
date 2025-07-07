import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user with their organization memberships
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        organizations: {
          where: { isActive: true },
          include: {
            organization: {
              select: {
                id: true,
                name: true,
                slug: true,
                primaryColor: true,
                domain: true,
              }
            }
          },
          orderBy: { joinedAt: 'desc' }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const organizations = user.organizations.map((orgUser: any) => ({
      id: orgUser.organization.id,
      name: orgUser.organization.name,
      slug: orgUser.organization.slug,
      primaryColor: orgUser.organization.primaryColor,
      domain: orgUser.organization.domain,
      role: orgUser.role,
    }))

    logger.info('Organizations fetched for user', {
      userId: user.id,
      userEmail: session.user.email,
      organizationCount: organizations.length
    })

    return NextResponse.json({ organizations })

  } catch (error) {
    logger.error('Error fetching organizations', error instanceof Error ? error : new Error(String(error)))
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 