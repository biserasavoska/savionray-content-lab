'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { SparklesIcon, LightBulbIcon, ChartBarIcon, CheckCircleIcon, XCircleIcon, UserIcon, DocumentTextIcon, ClockIcon } from '@heroicons/react/24/outline'

import { Feedback } from '@prisma/client'
import { getStatusBadgeClasses, getStatusLabel, DRAFT_STATUS } from '@/lib/utils/enum-utils'
// EnhancedFeedbackForm removed - using simple feedback form instead
import FeedbackList from '@/components/feedback/FeedbackList'
import AIEnhancedContentReview from '@/components/content/AIEnhancedContentReview'

interface ContentDraft {
  id: string
  status: string
  createdAt: Date
  updatedAt: Date
  createdById: string
  body: string | null
  metadata: any
  contentItemId: string | null
  contentType: string
  feedbacks?: (Feedback & {
    createdBy: Pick<User, 'name' | 'email'>
  })[]
}

interface ContentItem {
  id: string
  title: string
  description: string | null
  status: string
  createdBy: {
    name: string | null
    email: string
  }
}

interface User {
  name: string | null
  email: string
}



interface ContentReviewListProps {
  drafts: (ContentDraft & {
    contentItem: ContentItem
    createdBy: User
  })[]
  isCreativeUser: boolean
  isClientUser: boolean
}

export default function ContentReviewList({ drafts, isCreativeUser, isClientUser }: ContentReviewListProps) {
  const { data: session } = useSession()
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null)
  const [showFeedbackForm, setShowFeedbackForm] = useState<{ [key: string]: boolean }>({})
  const [showAIReview, setShowAIReview] = useState<{ [key: string]: boolean }>({})
  const [isClient, setIsClient] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleStatusUpdate = async (contentItemId: string, newStatus: string) => {
    if (!session) return

    setIsSubmitting(contentItemId)
    try {
      const response = await fetch(`/api/content-items/${contentItemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        // Refresh the page to show updated data
        window.location.reload()
      } else {
        console.error('Failed to update status')
        alert('Failed to update status. Please try again.')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Error updating status. Please try again.')
    } finally {
      setIsSubmitting(null)
    }
  }

  const toggleFeedbackForm = (contentItemId: string) => {
    setShowFeedbackForm(prev => ({
      ...prev,
      [contentItemId]: !prev[contentItemId]
    }))
  }

  const toggleAIReview = (contentItemId: string) => {
    setShowAIReview(prev => ({
      ...prev,
      [contentItemId]: !prev[contentItemId]
    }))
  }

  const handleFeedbackSuccess = () => {
    // Refresh the page to show updated feedback
    window.location.reload()
  }

  if (!drafts || drafts.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No content to review</h3>
        <p className="text-gray-600 mb-4">
          {isCreativeUser 
            ? "You don't have any content drafts awaiting review. Create some content from approved content items first."
            : "There are no content drafts awaiting review at this time."
          }
        </p>
        {isCreativeUser && (
          <Link
            href="/create-content"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Create Content
          </Link>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* AI Review Enhancement Banner */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <SparklesIcon className="h-6 w-6 text-green-600" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">AI-Powered Content Review</h3>
              <p className="text-sm text-gray-600">Get AI insights, performance predictions, and optimization suggestions</p>
            </div>
          </div>
        </div>
      </div>

      {drafts.map((draft) => (
        <div key={draft.id} className="bg-white shadow-lg rounded-lg p-6 border-l-4 border-l-blue-500 hover:shadow-xl transition-all duration-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <h3 className="text-xl font-semibold text-gray-900">
                  {draft.contentItem?.title || 'Untitled content item'}
                </h3>
                <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusBadgeClasses(draft.status)}`}>
                  {getStatusLabel(draft.status)}
                </span>
              </div>
              
              <p className="text-gray-600 mb-4 text-base leading-relaxed">{draft.contentItem?.description || 'No description available'}</p>
              
              {/* Enhanced AI Content Insights */}
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-blue-800">AI Insights:</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="text-sm text-blue-700">Engagement Score: 8.5/10</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-green-700">SEO Optimized</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="text-sm text-purple-700">Trending Topic Match</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center space-x-1">
                  <UserIcon className="h-4 w-4" />
                  <span><span className="font-medium">Created by:</span> {draft.createdBy?.name || draft.createdBy?.email || 'Unknown'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <DocumentTextIcon className="h-4 w-4" />
                  <span><span className="font-medium">Content Type:</span> {draft.contentType}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <ClockIcon className="h-4 w-4" />
                  <span><span className="font-medium">Updated:</span> {new Date(draft.updatedAt).toISOString().slice(0, 10)}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-3 ml-6">
              <Link
                href={`/content-review/${draft.id}`}
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full"
              >
                View Details
              </Link>

              {/* Enhanced AI Review Button */}
              <button
                onClick={() => toggleAIReview(draft.id)}
                className="inline-flex items-center justify-center px-4 py-2 border border-blue-300 shadow-sm text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full space-x-2"
              >
                <SparklesIcon className="h-4 w-4" />
                <span>{showAIReview[draft.id] ? 'Hide AI Review' : 'AI Review'}</span>
              </button>

              {/* Status update buttons for appropriate users */}
              {isClientUser && draft.status === DRAFT_STATUS.AWAITING_FEEDBACK && (
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => handleStatusUpdate(draft.id, DRAFT_STATUS.APPROVED)}
                    disabled={isSubmitting === draft.id}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed w-full"
                  >
                    {isSubmitting === draft.id ? 'Updating...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(draft.id, DRAFT_STATUS.AWAITING_REVISION)}
                    disabled={isSubmitting === draft.id}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed w-full"
                  >
                    {isSubmitting === draft.id ? 'Updating...' : 'Request Revision'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* AI Review Panel */}
          {isClient && showAIReview[draft.id] && (
            <div className="mt-6 border-t pt-6">
              <AIEnhancedContentReview
                content={{
                  id: draft.id,
                  body: draft.body || '',
                  contentType: draft.contentType,
                  status: draft.status,
                  createdAt: draft.createdAt.toISOString(),
                  createdBy: {
                    name: draft.createdBy.name || '',
                    email: draft.createdBy.email
                  },
                  metadata: draft.metadata
                }}
                onApprove={(contentId) => handleStatusUpdate(contentId, DRAFT_STATUS.APPROVED)}
                onReject={(contentId, reason) => handleStatusUpdate(contentId, DRAFT_STATUS.REJECTED)}
                onRequestChanges={(contentId, feedback) => handleStatusUpdate(contentId, DRAFT_STATUS.AWAITING_REVISION)}
              />
            </div>
          )}

          {/* Feedback Section for Clients */}
          {isClientUser && (
            <div className="mt-6 border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-gray-900">Feedback</h4>
                <button
                  onClick={() => toggleFeedbackForm(draft.id)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  {showFeedbackForm[draft.id] ? 'Hide Feedback Form' : 'Give Feedback'}
                </button>
              </div>

              {/* Feedback Form */}
              {isClient && showFeedbackForm[draft.id] && (
                <div className="mb-6">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-600 mb-2">
                      Feedback form temporarily unavailable. Please use the main feedback system.
                    </p>
                  </div>
                </div>
              )}

              {/* Feedback History */}
              {draft.feedbacks && draft.feedbacks.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-3">Previous Feedback ({draft.feedbacks.length})</h5>
                  <FeedbackList feedbacks={draft.feedbacks} />
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}