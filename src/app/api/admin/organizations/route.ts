import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdmin } from '@/lib/auth'
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

    // Only super admins can view all organizations
    // For now, we'll use ADMIN role as super admin
    if (!isAdmin(session)) {
      return NextResponse.json(
        { error: 'Super admin access required' },
        { status: 403 }
      )
    }

    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const search = url.searchParams.get('search') || ''
    const status = url.searchParams.get('status') || ''

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

    if (status) {
      where.subscriptionStatus = status
    }

    const [organizations, total] = await Promise.all([
      prisma.organization.findMany({
        where,
        include: {
          users: {
            where: { isActive: true },
            include: {
              user: {
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
              ideas: true,
              contentDrafts: true,
              deliveryPlans: true,
              contentItems: true
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
    const transformedOrganizations = organizations.map(org => ({
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
      userCount: org.users.length,
      stats: {
        ideas: org._count.ideas,
        contentDrafts: org._count.contentDrafts,
        deliveryPlans: org._count.deliveryPlans,
        contentItems: org._count.contentItems
      },
      users: org.users.map(orgUser => ({
        id: orgUser.user.id,
        name: orgUser.user.name,
        email: orgUser.user.email,
        systemRole: orgUser.user.role,
        organizationRole: orgUser.role
      }))
    }))

    logger.info('Organizations fetched by admin', {
      adminId: session.user.id,
      adminEmail: session.user.email,
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
    logger.error('Error fetching organizations', error instanceof Error ? error : new Error(String(error)))
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Only super admins can create organizations
    // For now, we'll use ADMIN role as super admin
    if (!isAdmin(session)) {
      return NextResponse.json(
        { error: 'Super admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { 
      name, 
      slug, 
      domain, 
      primaryColor = '#3B82F6',
      subscriptionPlan = 'FREE',
      maxUsers = 5,
      clientEmails = [],
      adminEmails = []
    } = body

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9-]+$/
    if (!slugRegex.test(slug)) {
      return NextResponse.json(
        { error: 'Slug must contain only lowercase letters, numbers, and hyphens' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existingOrg = await prisma.organization.findUnique({
      where: { slug }
    })

    if (existingOrg) {
      return NextResponse.json(
        { error: 'Organization slug already exists' },
        { status: 409 }
      )
    }

    // Create organization
    const organization = await prisma.organization.create({
      data: {
        name,
        slug,
        domain,
        primaryColor,
        subscriptionPlan,
        subscriptionStatus: 'ACTIVE',
        maxUsers,
        settings: {
          welcomeMessage: `Welcome to ${name}!`,
          defaultContentTypes: ['SOCIAL_MEDIA_POST', 'BLOG_POST'],
          approvalWorkflow: 'SIMPLE'
        }
      }
    })

    // Add creator as super admin
    await prisma.organizationUser.create({
      data: {
        organizationId: organization.id,
        userId: session.user.id,
        role: 'OWNER',
        permissions: ['ALL'],
        isActive: true,
        joinedAt: new Date()
      }
    })

    // Add client users
    for (const email of clientEmails) {
      let clientUser = await prisma.user.findUnique({
        where: { email }
      })

      if (!clientUser) {
        clientUser = await prisma.user.create({
          data: {
            email,
            name: email.split('@')[0],
            role: 'CLIENT',
            emailVerified: new Date()
          }
        })
      }

      await prisma.organizationUser.create({
        data: {
          organizationId: organization.id,
          userId: clientUser.id,
          role: 'ADMIN', // Give clients admin access to their organization
          permissions: ['APPROVE_IDEAS', 'VIEW_ALL_CONTENT', 'MANAGE_PLANS'],
          isActive: true,
          invitedBy: session.user.id,
          joinedAt: new Date()
        }
      })
    }

    // Add admin users
    for (const email of adminEmails) {
      let adminUser = await prisma.user.findUnique({
        where: { email }
      })

      if (!adminUser) {
        adminUser = await prisma.user.create({
          data: {
            email,
            name: email.split('@')[0],
            role: 'ADMIN',
            emailVerified: new Date()
          }
        })
      }

      await prisma.organizationUser.create({
        data: {
          organizationId: organization.id,
          userId: adminUser.id,
          role: 'MANAGER',
          permissions: ['CREATE_CONTENT', 'VIEW_ALL', 'MANAGE_WORKFLOWS'],
          isActive: true,
          invitedBy: session.user.id,
          joinedAt: new Date()
        }
      })
    }

    logger.info('Organization created by admin', {
      organizationId: organization.id,
      organizationName: organization.name,
      createdBy: session.user.id,
      clientCount: clientEmails.length,
      adminCount: adminEmails.length
    })

    return NextResponse.json({
      message: 'Organization created successfully',
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        domain: organization.domain,
        primaryColor: organization.primaryColor
      }
    })

  } catch (error) {
    logger.error('Error creating organization', error instanceof Error ? error : new Error(String(error)))
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 