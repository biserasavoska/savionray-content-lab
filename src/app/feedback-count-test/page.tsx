'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

interface FeedbackStats {
  total: number
  averageRating: number
  actionable: number
  highPriority: number
  byCategory: Record<string, number>
}

interface ClientStats {
  totalIdeas: number
  pendingDrafts: number
  pendingApprovals: number
  approved: number
  feedbackProvided: number
  totalContent: number
}

export default function FeedbackCountTestPage() {
  const { data: session } = useSession()
  const [clientStats, setClientStats] = useState<ClientStats | null>(null)
  const [feedbackStats, setFeedbackStats] = useState<FeedbackStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (session?.user) {
      fetchStats()
    }
  }, [session?.user])

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch client dashboard stats
      const clientResponse = await fetch('/api/client/stats')
      if (!clientResponse.ok) {
        throw new Error(`Client stats error: ${clientResponse.status}`)
      }
      const clientData = await clientResponse.json()
      setClientStats(clientData)
      
      // Fetch feedback management stats
      const feedbackResponse = await fetch('/api/feedback/management')
      if (!feedbackResponse.ok) {
        throw new Error(`Feedback stats error: ${feedbackResponse.status}`)
      }
      const feedbackData = await feedbackResponse.json()
      setFeedbackStats(feedbackData.stats)
      
    } catch (error) {
      console.error('Error fetching stats:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch stats')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading feedback statistics...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-700">{error}</p>
            <button
              onClick={fetchStats}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Feedback Count Test</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Client Dashboard Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Client Dashboard Stats</h2>
            {clientStats ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Ideas:</span>
                  <span className="font-semibold">{clientStats.totalIdeas}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pending Drafts:</span>
                  <span className="font-semibold">{clientStats.pendingDrafts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pending Approvals:</span>
                  <span className="font-semibold">{clientStats.pendingApprovals}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Approved:</span>
                  <span className="font-semibold">{clientStats.approved}</span>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span className="text-gray-600 font-medium">Feedback Provided (30 days):</span>
                  <span className="font-bold text-blue-600">{clientStats.feedbackProvided}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Content:</span>
                  <span className="font-semibold">{clientStats.totalContent}</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No client stats available</p>
            )}
          </div>

          {/* Feedback Management Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Feedback Management Stats</h2>
            {feedbackStats ? (
              <div className="space-y-3">
                <div className="flex justify-between border-b pb-3">
                  <span className="text-gray-600 font-medium">Total Feedback:</span>
                  <span className="font-bold text-green-600">{feedbackStats.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Rating:</span>
                  <span className="font-semibold">{feedbackStats.averageRating.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Actionable:</span>
                  <span className="font-semibold">{feedbackStats.actionable}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">High Priority:</span>
                  <span className="font-semibold">{feedbackStats.highPriority}</span>
                </div>
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">By Category:</h3>
                  {Object.entries(feedbackStats.byCategory).map(([category, count]) => (
                    <div key={category} className="flex justify-between text-sm">
                      <span className="text-gray-600 capitalize">{category}:</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No feedback stats available</p>
            )}
          </div>
        </div>

        {/* Verification Notes */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Verification Notes</h3>
          <ul className="list-disc list-inside space-y-2 text-blue-700">
            <li><strong>Client Dashboard "Feedback Provided":</strong> Should include feedback on both Ideas and ContentDrafts from the last 30 days</li>
            <li><strong>Feedback Management "Total Feedback":</strong> Should include all feedback on both Ideas and ContentDrafts</li>
            <li><strong>Both counts should match:</strong> If you have feedback on Ideas, both numbers should reflect that</li>
            <li><strong>Test by adding feedback:</strong> Add feedback to an Idea and a ContentDraft, then refresh this page</li>
          </ul>
        </div>

        <div className="mt-6">
          <button
            onClick={fetchStats}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mr-4"
          >
            Refresh Stats
          </button>
          <a 
            href="/" 
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 inline-block"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
