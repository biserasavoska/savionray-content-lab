import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if organization has users
    const userCount = await prisma.organizationUser.count({
      where: { organizationId: params.id }
    })

    if (userCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete organization with active users' },
        { status: 400 }
      )
    }

    await prisma.organization.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Organization deleted successfully' })
  } catch (error) {
    console.error('Error deleting organization:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
