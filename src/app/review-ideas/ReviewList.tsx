'use client'

import { useState } from 'react'
import FeedbackForm from './FeedbackForm'

type IdeaStatus = 'PENDING' | 'APPROVED_BY_CLIENT' | 'REJECTED_BY_CLIENT'

interface Creator {
  name: string | null
  email: string | null
}

interface Feedback {
  id: string
  comment: string
  createdAt: Date
  createdBy: Creator
}

interface ContentDraft {
  id: string
  body: string
  createdAt: Date
  createdBy: Creator
  feedbacks: Feedback[]
}

interface Idea {
  id: string
  title: string
  description: string
  status: IdeaStatus
  createdAt: Date
  createdBy: Creator
  contentDrafts: ContentDraft[]
}

interface ReviewListProps {
  initialIdeas: Idea[]
}

export default function ReviewList({ initialIdeas }: ReviewListProps) {
  const [ideas, setIdeas] = useState<Idea[]>(initialIdeas)
  const [expandedIdea, setExpandedIdea] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const getLatestFeedbacks = (idea: Idea) => {
    const latestDraft = idea.contentDrafts[0]
    return latestDraft?.feedbacks || []
  }

  const handleStatusUpdate = async (ideaId: string, status: IdeaStatus) => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/ideas/${ideaId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      setIdeas(ideas.map(idea => 
        idea.id === ideaId ? { ...idea, status } : idea
      ))
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFeedbackSubmit = async (ideaId: string, feedback: Feedback) => {
    setIdeas(ideas.map(idea =>
      idea.id === ideaId
        ? {
            ...idea,
            contentDrafts: [
              {
                ...idea.contentDrafts[0],
                feedbacks: [feedback, ...(idea.contentDrafts[0]?.feedbacks || [])]
              },
              ...idea.contentDrafts.slice(1)
            ]
          }
        : idea
    ))
  }

  return (
    <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
      {ideas.map((idea) => {
        const feedbacks = getLatestFeedbacks(idea)
        return (
          <div key={idea.id} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">{idea.title}</h3>
                <p className="mt-1 text-sm text-gray-500">
                  by {idea.createdBy.name || idea.createdBy.email}
                </p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                  ${idea.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                    idea.status === 'APPROVED_BY_CLIENT' ? 'bg-green-100 text-green-800' : 
                    'bg-red-100 text-red-800'}`}>
                  {idea.status.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            <p className="mt-3 text-sm text-gray-600">{idea.description}</p>

            <div className="mt-4">
              <button
                type="button"
                onClick={() => setExpandedIdea(expandedIdea === idea.id ? null : idea.id)}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                {expandedIdea === idea.id ? 'Hide Feedback' : 'Show Feedback'}
              </button>
            </div>

            {expandedIdea === idea.id && (
              <div className="mt-4 space-y-4">
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleStatusUpdate(idea.id, 'APPROVED_BY_CLIENT')}
                    disabled={isSubmitting || idea.status === 'APPROVED_BY_CLIENT'}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(idea.id, 'REJECTED_BY_CLIENT')}
                    disabled={isSubmitting || idea.status === 'REJECTED_BY_CLIENT'}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reject
                  </button>
                </div>

                <FeedbackForm ideaId={idea.id} onSubmit={handleFeedbackSubmit} />

                <div className="mt-4 space-y-4">
                  {feedbacks.map((feedback) => (
                    <div key={feedback.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">
                          {feedback.createdBy.name || feedback.createdBy.email}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(feedback.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{feedback.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}

      {ideas.length === 0 && (
        <div className="p-6 text-center text-gray-500">
          No ideas pending review
        </div>
      )}
    </div>
  )
} 