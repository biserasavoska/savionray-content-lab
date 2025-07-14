import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { prisma } from '@/lib/prisma'
import { authOptions , isCreative, isAdmin } from '@/lib/auth'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const scheduledPost = await prisma.scheduledPost.findUnique({
      where: { id: params.id },
      include: {
        contentDraft: {
          select: {
            createdById: true,
          },
        },
      },
    })

    if (!scheduledPost) {
      return NextResponse.json({ error: 'Scheduled post not found' }, { status: 404 })
    }

    // Only allow creators of the content or admins to cancel schedules
    if (!isAdmin(session) && scheduledPost.contentDraft.createdById !== session.user.id) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Delete the scheduled post
    await prisma.scheduledPost.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Scheduled post cancelled successfully' })
  } catch (error) {
    console.error('Failed to cancel scheduled post:', error)
    return NextResponse.json(
      { error: 'Failed to cancel scheduled post' },
      { status: 500 }
    )
  }
} 