import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { isCreative, isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ScheduledPostsList from './ScheduledPostsList'

export default async function ScheduledPostsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  if (!isCreative(session) && !isAdmin(session)) {
    redirect('/dashboard')
  }

  const scheduledPosts = await prisma.scheduledPost.findMany({
    where: {
      contentDraft: {
        ...(isCreative(session) ? { createdById: session.user.id } : {}),
      },
    },
    include: {
      contentDraft: {
        include: {
          createdBy: {
            select: {
              name: true,
              email: true,
            },
          },
          idea: {
            select: {
              title: true,
            },
          },
        },
      },
    },
    orderBy: {
      scheduledDate: 'asc',
    },
  })

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Scheduled Posts</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your scheduled content posts
          </p>
        </div>

        <div className="bg-white shadow rounded-lg">
          <ScheduledPostsList posts={scheduledPosts} />
        </div>
      </div>
    </div>
  )
} 