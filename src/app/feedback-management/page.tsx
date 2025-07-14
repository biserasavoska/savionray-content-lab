import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

import { authOptions , isClient, isAdmin } from '@/lib/auth'
import FeedbackManagementDashboard from '@/components/feedback/FeedbackManagementDashboard'

export const metadata: Metadata = {
  title: 'Feedback Management - SavionRay Content Lab',
  description: 'Review and manage feedback for your organization',
}

export default async function FeedbackManagementPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  // Only clients and admins can access feedback management
  if (!isClient(session) && !isAdmin(session)) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <FeedbackManagementDashboard />
      </div>
    </div>
  )
} 