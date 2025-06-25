'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { format } from 'date-fns'
import { isClient } from '@/lib/auth'

type IdeaWithDrafts = any

interface IdeaFeedbackPanelProps {
  idea: any
}

export default function IdeaFeedbackPanel({ idea }: IdeaFeedbackPanelProps) {
  const { data: session } = useSession()
  const [feedback, setFeedback] = useState('')
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  const handleIdeaApproval = async (approve: boolean) => {
    if (!session?.user?.id) return

    try {
      const response = await fetch(`/api/ideas/${idea.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: approve ? 'APPROVED' : 'REJECTED',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update idea status')
      }

      window.location.reload()
    } catch (error) {
      console.error('Error updating idea status:', error)
    }
  }

  const handleSaveForLater = async () => {
    if (!session?.user?.id) return

    try {
      const response = await fetch(`/api/ideas/${idea.id}/save`, {
        method: idea.savedForLater ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to save idea for later')
      }

      window.location.reload()
    } catch (error) {
      console.error('Error saving idea for later:', error)
    }
  }

  const handleSubmitComment = async () => {
    if (!comment.trim() || !session?.user?.id) return

    setIsSubmittingComment(true)
    try {
      const response = await fetch(`/api/ideas/${idea.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit comment')
      }

      setComment('')
      window.location.reload()
    } catch (error) {
      console.error('Error submitting comment:', error)
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleDraftApproval = async (draftId: string, status: string) => {
    if (!session?.user?.id) return

    try {
      const response = await fetch(`/api/ideas/${idea.id}/drafts/${draftId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error('Failed to update draft status')
      }

      window.location.reload()
    } catch (error) {
      console.error('Error updating draft status:', error)
    }
  }

  const handleSubmitFeedback = async (draftId: string) => {
    if (!feedback.trim() || !session?.user?.id) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/ideas/${idea.id}/drafts/${draftId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment: feedback }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit feedback')
      }

      setFeedback('')
      window.location.reload()
    } catch (error) {
      console.error('Error submitting feedback:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const latestDraft = idea.contentDrafts?.[0]

  return (
    <div className="space-y-6">
      {/* Idea Approval Section */}
      {isClient(session) && idea.status === 'PENDING' && (
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Review</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>Review and decide on this content idea.</p>
            </div>
            <div className="mt-5 space-x-4">
              <button
                onClick={() => handleIdeaApproval(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
              >
                Approve
              </button>
              <button
                onClick={() => handleIdeaApproval(false)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
              >
                Reject
              </button>
              <button
                onClick={handleSaveForLater}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                  idea.savedForLater ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {idea.savedForLater ? 'Saved' : 'Save for Later'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comments Section */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Comments</h3>
          
          {idea.comments?.map((comment: any) => (
            <div key={comment.id} className="mt-4 text-sm text-gray-700">
              <p className="font-medium">
                {comment.createdBy?.name || comment.createdBy?.email || 'Unknown User'} -{' '}
                {format(new Date(comment.createdAt), 'MMM d, yyyy')}:
              </p>
              <p className="mt-1">{comment.comment}</p>
            </div>
          ))}

          <div className="mt-4">
            <textarea
              rows={3}
              className="shadow-sm block w-full focus:ring-red-500 focus:border-red-500 sm:text-sm border border-gray-300 rounded-md"
              placeholder="Write a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <div className="mt-3">
              <button
                onClick={handleSubmitComment}
                disabled={isSubmittingComment || !comment.trim()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-300"
              >
                {isSubmittingComment ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Drafts Section */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Drafts</h3>
          
          {idea.contentDrafts?.map((draft: any, index: any) => (
            <div key={draft.id} className="mt-6 border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    Draft {index + 1} - {draft.status.replace(/_/g, ' ')}
                  </h4>
                  <p className="mt-1 text-sm text-gray-500">
                    By {draft.createdBy?.name || draft.createdBy?.email || 'Unknown User'} on{' '}
                    {format(new Date(draft.createdAt), 'MMM d, yyyy')}
                  </p>
                </div>
                {isClient(session) && (
                  <div className="space-x-4">
                    {draft.status === 'DRAFT' && (
                      <button
                        onClick={() => handleDraftApproval(draft.id, 'APPROVED')}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                      >
                        Approve
                      </button>
                    )}
                    {draft.status === 'DRAFT' && (
                      <button
                        onClick={() => handleDraftApproval(draft.id, 'AWAITING_REVISION')}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
                      >
                        Request Revision
                      </button>
                    )}
                    {draft.status === 'AWAITING_FEEDBACK' && (
                      <button
                        onClick={() => handleDraftApproval(draft.id, 'APPROVED')}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                      >
                        Approve
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-4 prose max-w-none text-gray-900">
                <div dangerouslySetInnerHTML={{ __html: draft.body }} />
              </div>

              {/* Feedback Section */}
              <div className="mt-6">
                <h5 className="text-sm font-medium text-gray-900">Feedback</h5>
                {draft.feedbacks?.map((feedback: any) => (
                  <div key={feedback.id} className="mt-2 text-sm text-gray-700">
                    <p className="font-medium">
                      {feedback.createdBy?.name || feedback.createdBy?.email || 'Unknown User'} -{' '}
                      {format(new Date(feedback.createdAt), 'MMM d, yyyy')}:
                    </p>
                    <p className="mt-1">{feedback.comment}</p>
                  </div>
                ))}

                {isClient(session) && 
                  (draft.status === 'DRAFT' || 
                   draft.status === 'AWAITING_FEEDBACK') && (
                    <div className="mt-4">
                      <textarea
                        rows={3}
                        className="shadow-sm block w-full focus:ring-red-500 focus:border-red-500 sm:text-sm border border-gray-300 rounded-md"
                        placeholder="Write feedback..."
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                      />
                      <div className="mt-3">
                        <button
                          onClick={() => handleSubmitFeedback(draft.id)}
                          disabled={isSubmitting || !feedback.trim()}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-300"
                        >
                          {isSubmitting ? 'Sending...' : 'Send'}
                        </button>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 