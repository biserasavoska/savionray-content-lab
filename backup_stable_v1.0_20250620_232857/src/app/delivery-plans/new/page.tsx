import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DeliveryPlanForm from '@/components/delivery/DeliveryPlanForm'

export const metadata: Metadata = {
  title: 'New Content Delivery Plan',
  description: 'Create a new content delivery plan',
}

export default async function NewDeliveryPlanPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">New Content Delivery Plan</h1>
        <div className="mt-8">
          <DeliveryPlanForm />
        </div>
      </div>
    </div>
  )
} 