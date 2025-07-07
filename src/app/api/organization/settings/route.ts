import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requireOrganizationContext } from '@/lib/utils/organization-context'
import { logger } from '@/lib/utils/logger'

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (!isAdmin(session)) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const orgContext = await requireOrganizationContext()
    if (!orgContext) {
      return NextResponse.json(
        { error: 'Organization context required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { name, slug, domain, primaryColor } = body

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    // Check if slug is unique (excluding current organization)
    const existingOrg = await prisma.organization.findFirst({
      where: {
        slug: slug,
        id: { not: orgContext.organizationId }
      }
    })

    if (existingOrg) {
      return NextResponse.json(
        { error: 'Organization slug already exists' },
        { status: 400 }
      )
    }

    // Update organization
    const updatedOrganization = await prisma.organization.update({
      where: { id: orgContext.organizationId },
      data: {
        name,
        slug,
        domain: domain || null,
        primaryColor: primaryColor || null,
      }
    })

    logger.info('Organization settings updated', {
      organizationId: orgContext.organizationId,
      userId: orgContext.userId,
      changes: { name, slug, domain, primaryColor }
    })

    return NextResponse.json({
      message: 'Organization settings updated successfully',
      organization: updatedOrganization
    })

  } catch (error) {
    logger.error('Error updating organization settings', error instanceof Error ? error : new Error(String(error)))
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const orgContext = await requireOrganizationContext()
    if (!orgContext) {
      return NextResponse.json(
        { error: 'Organization context required' },
        { status: 400 }
      )
    }

    const organization = await prisma.organization.findUnique({
      where: { id: orgContext.organizationId },
      include: {
        users: {
          where: { isActive: true },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              }
            }
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

    return NextResponse.json({ organization })

  } catch (error) {
    logger.error('Error fetching organization settings', error instanceof Error ? error : new Error(String(error)))
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 