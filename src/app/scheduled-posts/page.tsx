import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

import ScheduledPostsList from './ScheduledPostsList'

import { authOptions , isCreative, isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getOrganizationContext, requireOrganizationContext } from '@/lib/utils/organization-context'

export default async function ScheduledPostsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  if (!isCreative(session) && !isAdmin(session)) {
    redirect('/dashboard')
  }

  const orgContext = await requireOrganizationContext()
  if (!orgContext) {
    redirect('/auth/signin')
  }

  const scheduledPosts = await prisma.scheduledPost.findMany({
    where: {
      contentDraft: {
        organizationId: orgContext.organizationId,
        ...(isCreative(session) ? { createdById: session.user.id } : {}),
      },
    },
    include: {
      contentDraft: {
        include: {
          User: {
            select: {
              name: true,
              email: true,
            },
          },
          Idea: {
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