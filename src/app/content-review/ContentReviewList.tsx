'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

import { getStatusBadgeClasses, getStatusLabel, DRAFT_STATUS } from '@/lib/utils/enum-utils'
import EnhancedFeedbackForm from '@/components/feedback/EnhancedFeedbackForm'
import FeedbackList from '@/components/feedback/FeedbackList'

interface ContentDraft {
  id: string
  status: string
  createdAt: Date
  updatedAt: Date
  createdById: string
  body: string | null
  metadata: any
  ideaId: string | null
  contentType: string
  feedbacks?: (Feedback & {
    createdBy: Pick<User, 'name' | 'email'>
  })[]
}

interface Idea {
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

interface Feedback {
  id: string
  comment: string
  rating: number
  category: string
  priority: string
  actionable: boolean
  createdAt: Date
  contentDraftId: string
  createdById: string
}

interface ContentReviewListProps {
  drafts: (ContentDraft & {
    idea: Idea
    createdBy: User
  })[]
  isCreativeUser: boolean
  isClientUser: boolean
}

export default function ContentReviewList({ drafts, isCreativeUser, isClientUser }: ContentReviewListProps) {
  const { data: session } = useSession()
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null)
  const [showFeedbackForm, setShowFeedbackForm] = useState<{ [key: string]: boolean }>({})

  const handleStatusUpdate = async (draftId: string, newStatus: string) => {
    if (!session) return

    setIsSubmitting(draftId)
    try {
      const response = await fetch(`/api/content-drafts/${draftId}`, {
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

  const toggleFeedbackForm = (draftId: string) => {
    setShowFeedbackForm(prev => ({
      ...prev,
      [draftId]: !prev[draftId]
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
            ? "You don't have any content drafts awaiting review. Create some content from approved ideas first."
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
      {drafts.map((draft) => (
        <div key={draft.id} className="bg-white shadow rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-medium text-gray-900">
                  {draft.idea?.title || 'Untitled Idea'}
                </h3>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClasses(draft.status)}`}>
                  {getStatusLabel(draft.status)}
                </span>
              </div>
              
              <p className="text-gray-600 mb-4">{draft.idea?.description || 'No description available'}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                <div>
                  <span className="font-medium">Created by:</span> {draft.createdBy?.name || draft.createdBy?.email || 'Unknown'}
                </div>
                <div>
                  <span className="font-medium">Content Type:</span> {draft.contentType}
                </div>
                <div>
                  <span className="font-medium">Updated:</span> {new Date(draft.updatedAt).toISOString().slice(0, 10)}
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-2 ml-4">
              <Link
                href={`/content-review/${draft.id}`}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                View Details
              </Link>

              {/* Status update buttons for appropriate users */}
              {isClientUser && draft.status === DRAFT_STATUS.AWAITING_FEEDBACK && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleStatusUpdate(draft.id, DRAFT_STATUS.APPROVED)}
                    disabled={isSubmitting === draft.id}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting === draft.id ? 'Updating...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(draft.id, DRAFT_STATUS.AWAITING_REVISION)}
                    disabled={isSubmitting === draft.id}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting === draft.id ? 'Updating...' : 'Request Revision'}
                  </button>
                </div>
              )}
            </div>
          </div>

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
              {showFeedbackForm[draft.id] && (
                <div className="mb-6">
                  <EnhancedFeedbackForm
                    targetId={draft.id}
                    targetType="content"
                    onSuccess={handleFeedbackSuccess}
                    onCancel={() => toggleFeedbackForm(draft.id)}
                  />
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