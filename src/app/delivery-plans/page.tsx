import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

import { authOptions, isAdmin } from '@/lib/auth'
import DeliveryPlansList from '@/components/delivery/DeliveryPlansList'

export const metadata: Metadata = {
  title: 'Content Delivery Plans',
  description: 'Manage your content delivery plans and schedules',
}

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

export default async function DeliveryPlansPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  if (!isAdmin(session)) {
    redirect('/ready-content')
  }

  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Content Delivery Plans</h1>
          <a
            href="/delivery-plans/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Create New Plan
          </a>
        </div>

        <div className="mt-8">
          <DeliveryPlansList />
        </div>
      </div>
    </div>
  )
} 