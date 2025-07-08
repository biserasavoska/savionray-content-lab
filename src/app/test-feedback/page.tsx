'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import EnhancedFeedbackForm from '@/components/feedback/EnhancedFeedbackForm'
import FeedbackManagementDashboard from '@/components/feedback/FeedbackManagementDashboard'

export default function TestFeedbackPage() {
  const { data: session } = useSession()
  const [showDashboard, setShowDashboard] = useState(false)

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-gray-600">You need to be signed in to test feedback functionality.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Feedback System Test</h1>
            <p className="text-gray-600 mt-1">Test the enhanced feedback system</p>
          </div>

          <div className="space-y-6">
            {/* Test Controls */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Test Controls</h2>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowDashboard(!showDashboard)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {showDashboard ? 'Hide' : 'Show'} Feedback Dashboard
                </button>
              </div>
            </div>

            {/* Enhanced Feedback Form Test */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Enhanced Feedback Form Test</h2>
              <EnhancedFeedbackForm
                targetId="test-idea-123"
                targetType="idea"
                onSuccess={() => {
                  alert('Feedback submitted successfully!')
                  setShowDashboard(true)
                }}
              />
            </div>

            {/* Feedback Management Dashboard */}
            {showDashboard && (
              <div className="bg-white rounded-lg shadow">
                <FeedbackManagementDashboard />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 