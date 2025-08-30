import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions , isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'

export async function GET(request: NextRequest) {
  try {
    // Check if database is accessible
    try {
      await prisma.$queryRaw`SELECT 1`
    } catch (dbError) {
      logger.error('Database connection failed', dbError instanceof Error ? dbError : new Error(String(dbError)))
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 503 }
      )
    }

    const session = await getServerSession(authOptions)

    if (!session) {
      logger.warn('Admin organizations access attempted without session')
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Only super admins can view all organizations
    // For now, we'll use ADMIN role as super admin
    if (!isAdmin(session)) {
      logger.warn('Non-admin user attempted to access admin organizations', {
        userId: session.user.id,
        userRole: session.user.role
      })
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
    logger.error('Error fetching organizations', error instanceof Error ? error : new Error(String(error)), {
      timestamp: new Date().toISOString()
    })
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if database is accessible
    try {
      await prisma.$queryRaw`SELECT 1`
    } catch (dbError) {
      logger.error('Database connection failed during organization creation', dbError instanceof Error ? dbError : new Error(String(dbError)))
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 503 }
      )
    }

    const session = await getServerSession(authOptions)

    if (!session) {
      logger.warn('Organization creation attempted without session')
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Only super admins can create organizations
    // For now, we'll use ADMIN role as super admin
    if (!isAdmin(session)) {
      logger.warn('Non-admin user attempted to create organization', {
        userId: session.user.id,
        userRole: session.user.role
      })
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
      welcomeMessage = '',
      clientUsers = []
    } = body

    // Convert maxUsers to integer if it's a string
    const maxUsersInt = typeof maxUsers === 'string' ? parseInt(maxUsers, 10) : maxUsers

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

    // Check if domain already exists (only if domain is provided)
    if (domain && domain.trim()) {
      const existingDomainOrg = await prisma.organization.findUnique({
        where: { domain: domain.trim() }
      })

      if (existingDomainOrg) {
        return NextResponse.json(
          { error: 'Organization domain already exists' },
          { status: 409 }
        )
      }
    }

    // Validate client users
    if (!Array.isArray(clientUsers) || clientUsers.length === 0) {
      return NextResponse.json(
        { error: 'At least one client user is required' },
        { status: 400 }
      )
    }

    // Check for duplicate emails in client users
    const emails = clientUsers.map(user => user.email.toLowerCase())
    const uniqueEmails = new Set(emails)
    if (emails.length !== uniqueEmails.size) {
      return NextResponse.json(
        { error: 'Duplicate email addresses are not allowed' },
        { status: 400 }
      )
    }

    // Create organization
    const organization = await prisma.organization.create({
      data: {
        name,
        slug,
        domain: domain && domain.trim() ? domain.trim() : null,
        primaryColor,
        subscriptionPlan,
        subscriptionStatus: 'ACTIVE',
        maxUsers: maxUsersInt,
        settings: {
          welcomeMessage: welcomeMessage || `Welcome to ${name}!`,
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
    for (const clientUser of clientUsers) {
      // Skip if no email provided
      if (!clientUser.email || !clientUser.name) {
        continue
      }

      let user = await prisma.user.findUnique({
        where: { email: clientUser.email }
      })

      if (!user) {
        // Create new user
        user = await prisma.user.create({
          data: {
            email: clientUser.email,
            name: clientUser.name,
            role: clientUser.role || 'CLIENT',
            emailVerified: new Date()
          }
        })
      } else {
        // Update existing user's name if provided
        if (clientUser.name && user.name !== clientUser.name) {
          await prisma.user.update({
            where: { id: user.id },
            data: { name: clientUser.name }
          })
        }
      }

      // Create organization user relationship
      await prisma.organizationUser.create({
        data: {
          organizationId: organization.id,
          userId: user.id,
          role: clientUser.organizationRole || 'ADMIN',
          permissions: getPermissionsForRole(clientUser.organizationRole || 'ADMIN'),
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
      clientCount: clientUsers.length,
      welcomeMessage: welcomeMessage ? 'Custom' : 'Default'
    })

    return NextResponse.json({
      message: 'Organization created successfully',
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        domain: organization.domain,
        primaryColor: organization.primaryColor,
        clientUsers: clientUsers.length
      }
    })

  } catch (error) {
    logger.error('Error creating organization', error instanceof Error ? error : new Error(String(error)), {
      timestamp: new Date().toISOString()
    })
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to get permissions for organization roles
function getPermissionsForRole(role: string): string[] {
  switch (role) {
    case 'OWNER':
      return ['ALL']
    case 'ADMIN':
      return ['APPROVE_IDEAS', 'VIEW_ALL_CONTENT', 'MANAGE_PLANS', 'MANAGE_USERS', 'MANAGE_SETTINGS']
    case 'MANAGER':
      return ['CREATE_CONTENT', 'VIEW_ALL', 'MANAGE_WORKFLOWS', 'APPROVE_CONTENT']
    case 'MEMBER':
      return ['CREATE_CONTENT', 'VIEW_OWN_CONTENT', 'SUBMIT_FOR_REVIEW']
    case 'VIEWER':
      return ['VIEW_ALL_CONTENT']
    default:
      return ['VIEW_OWN_CONTENT']
  }
} 