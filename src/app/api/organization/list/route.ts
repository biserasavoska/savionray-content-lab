import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { logger } from '@/lib/utils/logger'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user with their organization memberships
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        organizationUsers: {
          where: { isActive: true },
          include: {
            organization: {
              select: {
                id: true,
                name: true,
                slug: true,
                primaryColor: true,
                createdAt: true,
              }
            }
          },
          orderBy: {
            organization: {
              name: 'asc'
            }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Transform the data to include role information
    const organizations = user.organizationUsers.map(ou => ({
      id: ou.organization.id,
      name: ou.organization.name,
      slug: ou.organization.slug,
      primaryColor: ou.organization.primaryColor,
      role: ou.role,
      createdAt: ou.organization.createdAt
    }))

    logger.info('Organizations fetched for user', {
      userId: user.id,
      userEmail: session.user.email,
      organizationCount: organizations.length
    })

    return NextResponse.json({
      organizations,
      total: organizations.length
    })
  } catch (error) {
    logger.error('Error fetching organizations', error instanceof Error ? error : new Error(String(error)))
    return NextResponse.json(
      { error: 'Failed to fetch organizations' },
      { status: 500 }
    )
  }
} 