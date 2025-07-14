import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { organizationId } = await request.json()

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      )
    }

    // Verify user belongs to this organization
    const organizationUser = await prisma.organizationUser.findFirst({
      where: {
        userId: session.user.id,
        organizationId: organizationId,
        isActive: true,
      },
      include: {
        organization: true,
      },
    })

    if (!organizationUser) {
      return NextResponse.json(
        { error: 'User does not have access to this organization' },
        { status: 403 }
      )
    }

    // Return the organization details
    return NextResponse.json({
      success: true,
      organization: organizationUser.organization,
    })

  } catch (error) {
    console.error('Error switching organization:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 