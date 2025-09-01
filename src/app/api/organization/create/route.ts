import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions , isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'
import { validateAdminSessionUser } from '@/lib/utils/session-validation'

export async function POST(request: NextRequest) {
  try {
    // 🚨 CRITICAL: Use session validation utility to get REAL user ID
    const validation = await validateAdminSessionUser()
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status || 401 }
      )
    }
    
    // Use the REAL user ID from database, not the session ID
    const realUserId = validation.realUserId
    const userEmail = validation.userEmail
    const userRole = validation.userRole
    
    console.log('🔍 DEBUG: Session validation successful:', {
      sessionUserId: validation.sessionUserId,
      databaseUserId: realUserId,
      userEmail,
      userRole
    })

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

    // Add creator as owner - ✅ Use REAL user ID
    await prisma.organizationUser.create({
      data: {
        organizationId: organization.id,
        userId: realUserId,
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

      // Add client to organization - ✅ Use REAL user ID for invitedBy
      await prisma.organizationUser.create({
        data: {
          organizationId: organization.id,
          userId: clientUser.id,
          role: 'ADMIN', // Give client admin access to their organization
          permissions: ['APPROVE_IDEAS', 'VIEW_ALL_CONTENT', 'MANAGE_PLANS'],
          isActive: true,
          invitedBy: realUserId,
          joinedAt: new Date()
        }
      })
    }

    logger.info('Organization created', {
      organizationId: organization.id,
      organizationName: organization.name,
      createdBy: realUserId,
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