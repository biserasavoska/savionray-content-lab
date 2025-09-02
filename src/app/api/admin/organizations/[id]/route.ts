import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'
import { validateAdminSessionUser } from '@/lib/utils/session-validation'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const organization = await prisma.organization.findUnique({
      where: { id: params.id },
      include: {
        OrganizationUser: {
          include: {
            User_OrganizationUser_userIdToUser: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                image: true
              }
            }
          }
        }
      }
    })

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    return NextResponse.json(organization)
  } catch (error) {
    console.error('Error fetching organization:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      slug,
      domain,
      primaryColor,
      subscriptionPlan,
      maxUsers
    } = body

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    // Check if slug is already taken by another organization
    const existingOrg = await prisma.organization.findFirst({
      where: {
        slug,
        id: { not: params.id }
      }
    })

    if (existingOrg) {
      return NextResponse.json(
        { error: 'Slug is already taken' },
        { status: 400 }
      )
    }

    // Convert maxUsers to integer if it's a string
    const maxUsersInt = typeof maxUsers === 'string' ? parseInt(maxUsers, 10) : maxUsers

    const updatedOrganization = await prisma.organization.update({
      where: { id: params.id },
      data: {
        name,
        slug,
        domain: domain || null,
        primaryColor: primaryColor || '#3B82F6',
        subscriptionPlan: subscriptionPlan || 'FREE',
        maxUsers: maxUsersInt || 5,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(updatedOrganization)
  } catch (error) {
    console.error('Error updating organization:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 🚨 CRITICAL: Use session validation utility to get REAL user ID
    const validation = await validateAdminSessionUser()
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status || 401 }
      )
    }
    
    const realUserId = validation.realUserId
    const userEmail = validation.userEmail
    const userRole = validation.userRole

    // Get organization details for logging
    const organization = await prisma.organization.findUnique({
      where: { id: params.id },
      include: {
        OrganizationUser: true,
        Idea: true,
        ContentDraft: true,
        ContentItem: true,
        deliveryPlans: true,
        _count: {
          select: {
            Idea: true,
            ContentDraft: true,
            ContentItem: true,
            deliveryPlans: true
          }
        }
      }
    })

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    // 🛡️ COMPREHENSIVE DELETION GUARDRAILS
    
    // 1. Check for active users
    if (organization.OrganizationUser.length > 0) {
      logger.warn('Organization deletion blocked - has active users', {
        organizationId: params.id,
        organizationName: organization.name,
        userCount: organization.OrganizationUser.length,
        deletedBy: realUserId,
        deletedByEmail: userEmail
      })
      
      return NextResponse.json(
        { 
          error: 'Cannot delete organization with active users',
          details: {
            userCount: organization.OrganizationUser.length,
            message: 'Please remove all users from the organization before deletion'
          }
        },
        { status: 400 }
      )
    }

    // 2. Check for content that should be preserved
    const hasContent = organization._count.Idea > 0 || 
                      organization._count.ContentDraft > 0 || 
                      organization._count.ContentItem > 0 ||
                      organization._count.deliveryPlans > 0

    if (hasContent) {
      logger.warn('Organization deletion blocked - has content data', {
        organizationId: params.id,
        organizationName: organization.name,
        contentStats: {
          ideas: organization._count.Idea,
          contentDrafts: organization._count.ContentDraft,
          contentItems: organization._count.ContentItem,
          deliveryPlans: organization._count.deliveryPlans
        },
        deletedBy: realUserId,
        deletedByEmail: userEmail
      })
      
      return NextResponse.json(
        { 
          error: 'Cannot delete organization with existing content',
          details: {
            contentStats: {
              ideas: organization._count.Idea,
              contentDrafts: organization._count.ContentDraft,
              contentItems: organization._count.ContentItem,
              deliveryPlans: organization._count.deliveryPlans
            },
            message: 'Please archive or transfer all content before deletion'
          }
        },
        { status: 400 }
      )
    }

    // 3. Check if this is the last organization (safety check)
    const totalOrganizations = await prisma.organization.count()
    if (totalOrganizations <= 1) {
      logger.error('Organization deletion blocked - would delete last organization', undefined, {
        organizationId: params.id,
        organizationName: organization.name,
        totalOrganizations,
        deletedBy: realUserId,
        deletedByEmail: userEmail
      })
      
      return NextResponse.json(
        { 
          error: 'Cannot delete the last organization in the system',
          details: {
            message: 'At least one organization must remain in the system'
          }
        },
        { status: 400 }
      )
    }

    // 🗑️ PROCEED WITH CASCADE DELETION
    logger.info('Starting organization deletion process', {
      organizationId: params.id,
      organizationName: organization.name,
      deletedBy: realUserId,
      deletedByEmail: userEmail,
      contentStats: organization._count
    })

    // Use transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      // Delete all related data in proper order (respecting foreign key constraints)
      
      // 1. Delete organization users (should be 0, but just in case)
      await tx.organizationUser.deleteMany({
        where: { organizationId: params.id }
      })

      // 2. Delete content items
      await tx.contentItem.deleteMany({
        where: { organizationId: params.id }
      })

      // 3. Delete content drafts
      await tx.contentDraft.deleteMany({
        where: { organizationId: params.id }
      })

      // 4. Delete content delivery plans
      await tx.contentDeliveryPlan.deleteMany({
        where: { organizationId: params.id }
      })

      // 5. Delete ideas
      await tx.idea.deleteMany({
        where: { organizationId: params.id }
      })

      // 6. Finally, delete the organization
      await tx.organization.delete({
        where: { id: params.id }
      })
    })

    // 📝 AUDIT LOGGING
    logger.info('Organization successfully deleted', {
      organizationId: params.id,
      organizationName: organization.name,
      organizationSlug: organization.slug,
      deletedBy: realUserId,
      deletedByEmail: userEmail,
      deletedAt: new Date().toISOString(),
      contentStats: organization._count
    })

    return NextResponse.json({ 
      message: 'Organization deleted successfully',
      deletedOrganization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug
      }
    })
  } catch (error) {
    logger.error('Error deleting organization', error instanceof Error ? error : undefined, {
      organizationId: params.id
    })
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
