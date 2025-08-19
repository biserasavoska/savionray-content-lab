import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user with their organization membership
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        organizationUsers: {
          where: { isActive: true },
          include: {
            organization: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check what organizations exist
    const allOrganizations = await prisma.organization.findMany({
      select: { id: true, name: true, slug: true }
    })

    // Check what organization users exist
    const allOrganizationUsers = await prisma.organizationUser.findMany({
      select: { 
        id: true, 
        organizationId: true, 
        userId: true, 
        isActive: true,
        role: true
      }
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        organizationUsersCount: user.organizationUsers.length
      },
      userOrganizationUsers: user.organizationUsers.map(ou => ({
        id: ou.id,
        organizationId: ou.organizationId,
        organizationName: ou.organization.name,
        role: ou.role,
        isActive: ou.isActive
      })),
      allOrganizations,
      allOrganizationUsers,
      debug: {
        hasActiveOrganizations: user.organizationUsers.length > 0,
        totalOrganizations: allOrganizations.length,
        totalOrganizationUsers: allOrganizationUsers.length
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Debug endpoint error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
