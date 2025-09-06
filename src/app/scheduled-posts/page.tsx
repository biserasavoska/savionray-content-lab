import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

import { authOptions, isCreative, isAdmin } from '@/lib/auth'
import ScheduledPostsList from '@/app/scheduled-posts/ScheduledPostsList'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

export default async function ScheduledPostsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  if (!isCreative(session) && !isAdmin(session)) {
    redirect('/dashboard')
  }

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
          <ScheduledPostsList />
        </div>
      </div>
    </div>
  )
}