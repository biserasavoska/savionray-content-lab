import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions , isAdmin, isCreative } from '@/lib/auth'
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

    // Only Creative and Admin users can access client organizations
    if (!isCreative(session) && !isAdmin(session)) {
      return NextResponse.json(
        { error: 'Access denied. Creative or Admin role required.' },
        { status: 403 }
      )
    }

    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const search = url.searchParams.get('search') || ''

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { domain: { contains: search, mode: 'insensitive' } }
      ]
    }

    // For Creative users, only show organizations they have access to
    if (isCreative(session) && !isAdmin(session)) {
      const userOrganizations = await prisma.organizationUser.findMany({
        where: {
          userId: session.user.id,
          isActive: true
        },
        select: {
          organizationId: true
        }
      })
      
      const organizationIds = userOrganizations.map((org: any) => org.organizationId)
      where.id = { in: organizationIds }
    }

    const [organizations, total] = await Promise.all([
      prisma.organization.findMany({
        where,
        include: {
          OrganizationUser: {
            where: { isActive: true },
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
          },
          _count: {
            select: {
              Idea: true,
              ContentDraft: true,
              deliveryPlans: true,
              ContentItem: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.organization.count({ where })
    ])

    // Transform data for frontend
    const transformedOrganizations = organizations.map((org: any) => ({
      id: org.id,
      name: org.name,
      slug: org.slug,
      domain: org.domain,
      primaryColor: org.primaryColor,
      subscriptionPlan: org.subscriptionPlan,
      subscriptionStatus: org.subscriptionStatus,
      maxUsers: org.maxUsers,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt,
      userCount: org.OrganizationUser.length,
      stats: {
        ideas: org._count.Idea,
        contentDrafts: org._count.ContentDraft,
        deliveryPlans: org._count.deliveryPlans,
        contentItems: org._count.ContentItem
      },
      users: org.OrganizationUser.map((orgUser: any) => ({
        id: orgUser.User_OrganizationUser_userIdToUser.id,
        name: orgUser.User_OrganizationUser_userIdToUser.name,
        email: orgUser.User_OrganizationUser_userIdToUser.email,
        systemRole: orgUser.User_OrganizationUser_userIdToUser.role,
        organizationRole: orgUser.role
      }))
    }))

    logger.info('Client organizations fetched', {
      userId: session.user.id,
      userEmail: session.user.email,
      userRole: session.user.role,
      organizationCount: total,
      page,
      limit
    })

    return NextResponse.json({
      organizations: transformedOrganizations,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit
      }
    })

  } catch (error) {
    logger.error('Error fetching client organizations', error instanceof Error ? error : new Error(String(error)))
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 