import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions, isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requireOrganizationContext } from '@/lib/utils/organization-context'
import { logger } from '@/lib/utils/logger'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const orgContext = await requireOrganizationContext(undefined, request)
    if (!orgContext) {
      return NextResponse.json(
        { error: 'Organization context required' },
        { status: 400 }
      )
    }

    const userId = params.id

    // Check if user exists in organization
    const organizationUser = await prisma.organizationUser.findFirst({
      where: {
        userId: userId,
        organizationId: orgContext.organizationId,
        isActive: true
      }
    })

    if (!organizationUser) {
      return NextResponse.json(
        { error: 'User not found in organization' },
        { status: 404 }
      )
    }

    // Prevent deleting organization owner
    if (organizationUser.role === 'OWNER') {
      return NextResponse.json(
        { error: 'Cannot delete organization owner' },
        { status: 403 }
      )
    }

    // Prevent deleting yourself
    if (userId === orgContext.userId) {
      return NextResponse.json(
        { error: 'Cannot delete yourself' },
        { status: 403 }
      )
    }

    // Check if user is a super admin (prevent deletion)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isSuperAdmin: true }
    })

    if (user?.isSuperAdmin) {
      return NextResponse.json(
        { error: 'Cannot delete super admin users' },
        { status: 403 }
      )
    }

    // Start a transaction to delete user and all related data
    await prisma.$transaction(async (tx) => {
      // First, remove user from all organizations
      await tx.organizationUser.deleteMany({
        where: { userId: userId }
      })

      // Delete user's ideas
      await tx.idea.deleteMany({
        where: { createdById: userId }
      })

      // Delete user's content drafts
      await tx.contentDraft.deleteMany({
        where: { createdById: userId }
      })

      // Delete user's feedback
      await tx.feedback.deleteMany({
        where: { createdById: userId }
      })

      // Delete user's media
      await tx.media.deleteMany({
        where: { uploadedById: userId }
      })

      // Finally, delete the user
      await tx.user.delete({
        where: { id: userId }
      })
    })

    logger.info('User permanently deleted', {
      organizationId: orgContext.organizationId,
      userId: userId,
      deletedBy: orgContext.userId
    })

    return NextResponse.json({
      message: 'User permanently deleted successfully'
    })

  } catch (error) {
    logger.error('Error permanently deleting user', error instanceof Error ? error : new Error(String(error)))
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
