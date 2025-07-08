import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Only admins can create organizations
    if (!isAdmin(session)) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { 
      name, 
      slug, 
      domain, 
      primaryColor = '#3B82F6',
      clientEmail,
      clientName,
      clientRole = 'CLIENT'
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
        subscriptionPlan: 'FREE',
        subscriptionStatus: 'ACTIVE',
        maxUsers: 5,
        maxStorageGB: 10,
        settings: {
          welcomeMessage: `Welcome to ${name}!`,
          defaultContentTypes: ['SOCIAL_MEDIA_POST', 'BLOG_POST'],
          approvalWorkflow: 'SIMPLE'
        }
      }
    })

    // Add creator as owner
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

    // If client email provided, create or invite client user
    if (clientEmail) {
      let clientUser = await prisma.user.findUnique({
        where: { email: clientEmail }
      })

      if (!clientUser) {
        // Create new user
        clientUser = await prisma.user.create({
          data: {
            email: clientEmail,
            name: clientName || clientEmail.split('@')[0],
            role: clientRole as any,
            emailVerified: new Date() // Auto-verify for now
          }
        })
      }

      // Add client to organization
      await prisma.organizationUser.create({
        data: {
          organizationId: organization.id,
          userId: clientUser.id,
          role: 'ADMIN', // Give client admin access to their organization
          permissions: ['APPROVE_IDEAS', 'VIEW_ALL_CONTENT', 'MANAGE_PLANS'],
          isActive: true,
          invitedBy: session.user.id,
          joinedAt: new Date()
        }
      })
    }

    logger.info('Organization created', {
      organizationId: organization.id,
      organizationName: organization.name,
      createdBy: session.user.id,
      clientEmail
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