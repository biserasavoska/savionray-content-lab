// 🚨 CRITICAL: This file has been modified to fix organization creation 500 errors
// 🚨 Railway must deploy this updated code immediately
// 🚨 Enhanced logging and debugging has been added throughout
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions , isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'

export async function GET(request: NextRequest) {
  try {
    // Check if database is accessible - DEFAULT CONFIG TEST
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
  // 🚀 DEPLOYMENT MARKER - This should appear in Railway logs if deployed
  console.log('🚀 ENHANCED LOGGING VERSION DEPLOYED - Organization creation API called')
  console.log('🔍 DEBUG: Function execution started at:', new Date().toISOString())
  console.log('🔍 DEBUG: This should show up in Railway logs if deployed')
  
  try {
    console.log('=== FUNCTION CALLED: POST ===')
    console.log('Function execution started at:', new Date().toISOString())
    
    console.log('=== ORGANIZATION CREATION START ===')
    console.log('Request received at:', new Date().toISOString())
    
    console.log('Getting server session...')
    const session = await getServerSession(authOptions)
    console.log('🔍 DEBUG: Session obtained:', !!session, session?.user?.id)
    
    // Check if database is accessible
    try {
      console.log('Testing database connection...')
      await prisma.$queryRaw`SELECT 1`
      console.log('Database connection successful')
    } catch (dbError) {
      console.error('Database connection failed:', dbError)
      logger.error('Database connection failed during organization creation', dbError instanceof Error ? dbError : new Error(String(dbError)))
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 503 }
      )
    }
    
    if (!session) {
      console.log('No session found - returning 401')
      logger.warn('Organization creation attempted without session')
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    console.log('User authenticated:', session.user.email)
    console.log('User role:', session.user.role)

    if (!isAdmin(session)) {
      console.log('User is not admin - returning 403')
      logger.warn('Non-admin user attempted to create organization', {
        userId: session.user.id,
        userRole: session.user.role
      })
      return NextResponse.json(
        { error: 'Super admin access required' },
        { status: 403 }
      )
    }

    console.log('Parsing request body...')
    const body = await request.json()
    console.log('Request body parsed successfully')
    console.log('Body keys:', Object.keys(body))

    const {
      name,
      slug,
      domain,
      primaryColor,
      subscriptionPlan,
      maxUsers,
      welcomeMessage,
      clientUsers
    } = body

    // Validate required fields
    if (!name || !slug || !clientUsers || !Array.isArray(clientUsers) || clientUsers.length === 0) {
      logger.warn('Invalid organization creation request - missing required fields', {
        userId: session.user.id,
        hasName: !!name,
        hasSlug: !!slug,
        hasClientUsers: !!clientUsers,
        clientUsersLength: clientUsers?.length
      })
      return NextResponse.json(
        { error: 'Missing required fields: name, slug, and at least one client user are required' },
        { status: 400 }
      )
    }

    // Check if organization with same slug already exists
    const existingOrg = await prisma.organization.findUnique({
      where: { slug }
    })

    if (existingOrg) {
      logger.warn('Organization creation failed - slug already exists', {
        userId: session.user.id,
        requestedSlug: slug,
        existingOrgId: existingOrg.id
      })
      return NextResponse.json(
        { error: 'Organization with this slug already exists' },
        { status: 409 }
      )
    }

    logger.info('Starting organization creation process', {
      userId: session.user.id,
      organizationName: name,
      organizationSlug: slug,
      clientUserCount: clientUsers.length
    })

    console.log('About to start database transaction...')
    console.log('Organization data:', { name, slug, domain, primaryColor, subscriptionPlan, maxUsers, welcomeMessage })
    console.log('Client users data:', clientUsers)

    // Wrap everything in a transaction for atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Create the organization
      const organization = await tx.organization.create({
        data: {
          name,
          slug,
          domain: domain || null,
          primaryColor: primaryColor || '#3B82F6',
          subscriptionPlan: subscriptionPlan || 'FREE',
          maxUsers: maxUsers || 5,
          settings: {
            welcomeMessage: welcomeMessage || `Welcome to ${name}!`
          }
        }
      })

      logger.info('Organization created successfully', {
        userId: session.user.id,
        organizationId: organization.id,
        organizationName: organization.name
      })

      // Create the admin user relationship
      const adminUserData = {
        organizationId: organization.id,
        userId: session.user.id,
        role: 'OWNER' as const,
        permissions: ['ALL'],
        isActive: true,
        joinedAt: new Date()
      }
      await tx.organizationUser.create({
        data: adminUserData
      })

      logger.info('Admin user relationship created', {
        userId: session.user.id,
        organizationId: organization.id
      })

      // Add client users
      for (const clientUser of clientUsers) {
        try {
          // Skip if no email provided
          if (!clientUser.email || !clientUser.name) {
            logger.warn('Skipping client user - missing email or name', {
              userId: session.user.id,
              organizationId: organization.id,
              clientUser
            })
            continue
          }

          logger.info('Processing client user', {
            userId: session.user.id,
            organizationId: organization.id,
            clientUserEmail: clientUser.email,
            clientUserName: clientUser.name
          })

          let user = await tx.user.findUnique({
            where: { email: clientUser.email }
          })

          if (!user) {
            // Create new user
            console.log('🔍 DEBUG: Creating new user for client:', clientUser.email)
            logger.info('Creating new user for client', {
              userId: session.user.id,
              organizationId: organization.id,
              clientUserEmail: clientUser.email
            })
            
            const userData = {
              email: clientUser.email,
              name: clientUser.name,
              role: clientUser.role || 'CLIENT',
              emailVerified: new Date()
            }
            
            console.log('🔍 DEBUG: User data to create:', JSON.stringify(userData, null, 2))
            logger.info('User data to create:', userData)
            
            try {
              console.log('🔍 DEBUG: About to create user in database...')
              user = await tx.user.create({
                data: userData
              })
              console.log('🔍 DEBUG: User created successfully:', JSON.stringify(user, null, 2))
            } catch (userCreateError) {
              console.log('🔍 DEBUG: User creation failed:', userCreateError)
              throw userCreateError
            }
            
            logger.info('New user created successfully', {
              userId: session.user.id,
              organizationId: organization.id,
              newUserId: user.id,
              clientUserEmail: clientUser.email,
              createdUser: user
            })
            
            // CRITICAL: Log the user object immediately after creation
            console.log('🔍 DEBUG: User object immediately after creation:', JSON.stringify(user, null, 2))
            logger.info('User object immediately after creation:', {
              userId: session.user.id,
              organizationId: organization.id,
              userObject: user,
              userType: typeof user,
              userKeys: user ? Object.keys(user) : 'NO_USER',
              userIdType: user?.id ? typeof user.id : 'NO_ID',
              userIdValue: user?.id
            })
            
            // CRITICAL: Verify user ID is valid UUID
            if (!user.id || typeof user.id !== 'string' || user.id.length < 10) {
              console.log('🔍 DEBUG: CRITICAL - User created but ID is invalid!')
              logger.error('CRITICAL: User created but ID is invalid!', undefined, {
                userId: session.user.id,
                organizationId: organization.id,
                createdUser: user,
                userIdValue: user?.id,
                userIdType: typeof user?.id,
                userIdLength: user?.id?.length
              })
              throw new Error(`User created but ID is invalid: ${JSON.stringify(user)}`)
            }
            
            console.log('🔍 DEBUG: User ID validation passed:', user.id)
          } else {
            console.log('🔍 DEBUG: Using existing user:', JSON.stringify(user, null, 2))
            // Update existing user's name if provided
            if (clientUser.name && user.name !== clientUser.name) {
              logger.info('Updating existing user name', {
                userId: session.user.id,
                organizationId: organization.id,
                existingUserId: user.id,
                oldName: user.name,
                newName: clientUser.name
              })
              await tx.user.update({
                where: { id: user.id },
                data: { name: clientUser.name }
              })
            }
          }

          // Validate user exists before creating relationship
          console.log('🔍 DEBUG: Validating user before relationship creation...')
          if (!user || !user.id) {
            console.log('🔍 DEBUG: User validation failed - user is invalid')
            logger.error('Cannot create organization user relationship - user is invalid', undefined, {
              userId: session.user.id,
              organizationId: organization.id,
              clientUserEmail: clientUser.email,
              userExists: !!user,
              userIdExists: !!user?.id
            })
            throw new Error(`Invalid user data for client: ${clientUser.email}`)
          }

          console.log('🔍 DEBUG: User validation passed, proceeding to create relationship')
          // CRITICAL: Additional validation before relationship creation
          logger.info('Final user validation before relationship creation:', {
            userId: session.user.id,
            organizationId: organization.id,
            userObject: user,
            userType: typeof user,
            userKeys: user ? Object.keys(user) : 'NO_USER',
            userIdValue: user?.id,
            userIdType: typeof user?.id,
            userIdLength: user?.id?.length,
            userEmail: user?.email,
            userRole: user?.role
          })

          // Create organization user relationship
          console.log('🔍 DEBUG: Creating organization user relationship...')
          logger.info('Creating organization user relationship', {
            userId: session.user.id,
            organizationId: organization.id,
            clientUserId: user.id,
            clientUserRole: clientUser.organizationRole || 'ADMIN'
          })
          
          // Double-check user exists and has valid ID
          console.log('🔍 DEBUG: Final user check before database call...')
          logger.info('User validation before creating relationship:', {
            userExists: !!user,
            userId: user?.id,
            userEmail: user?.email,
            userRole: user?.role
          })
          
          const organizationUserData = {
            organizationId: organization.id,
            userId: user.id,
            role: clientUser.organizationRole || 'ADMIN',
            permissions: getPermissionsForRole(clientUser.organizationRole || 'ADMIN'),
            isActive: true,
            invitedBy: session.user.id,
            joinedAt: new Date()
          }
          
          console.log('🔍 DEBUG: Organization user data to create:', JSON.stringify(organizationUserData, null, 2))
          logger.info('Organization user data to create:', organizationUserData)
          
          // CRITICAL: Final validation before database call
          console.log('🔍 DEBUG: About to create OrganizationUser in database...')
          logger.info('About to create OrganizationUser with data:', {
            userId: session.user.id,
            organizationId: organization.id,
            organizationUserData,
            userObject: user,
            userExists: !!user,
            userIdExists: !!user?.id
          })
          
          try {
            console.log('🔍 DEBUG: Executing OrganizationUser.create()...')
            await tx.organizationUser.create({
              data: organizationUserData
            })
            console.log('🔍 DEBUG: OrganizationUser created successfully!')
          } catch (orgUserError) {
            console.log('🔍 DEBUG: OrganizationUser creation failed:', orgUserError)
            throw orgUserError
          }
        } catch (clientUserError) {
          logger.error('Error processing client user', clientUserError instanceof Error ? clientUserError : new Error(String(clientUserError)), {
            userId: session.user.id,
            organizationId: organization.id,
            clientUser,
            error: clientUserError instanceof Error ? clientUserError.message : String(clientUserError),
            errorStack: clientUserError instanceof Error ? clientUserError.stack : undefined
          })
          // Re-throw to trigger transaction rollback
          throw clientUserError
        }
      }

      return organization
    })

    logger.info('Organization created by admin', {
      organizationId: result.id,
      organizationName: result.name,
      createdBy: session.user.id,
      clientCount: clientUsers.length,
      welcomeMessage: welcomeMessage ? 'Custom' : 'Default'
    })

    return NextResponse.json({
      message: 'Organization created successfully',
      organization: {
        id: result.id,
        name: result.name,
        slug: result.slug,
        domain: result.domain,
        primaryColor: result.primaryColor,
        clientUsers: clientUsers.length
      }
    })

  } catch (error) {
    logger.error('Error creating organization', error instanceof Error ? error : new Error(String(error)), {
      timestamp: new Date().toISOString(),
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined
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