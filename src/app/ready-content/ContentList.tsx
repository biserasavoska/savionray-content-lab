'use client'

import { useState } from 'react'
import Link from 'next/link'

import { formatDate } from '../../lib/utils/date-helpers'
import { DRAFT_STATUS } from '../../lib/utils/enum-constants'

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
  status: string
  createdAt: Date
  createdBy: Creator
  feedbacks: Feedback[]
}

interface Idea {
  id: string
  title: string
  description: string
  publishingDateTime: Date | null
  savedForLater: boolean
  mediaType: string | null
  createdAt: Date
  createdBy: Creator
  contentDrafts: ContentDraft[]
}

interface ContentListProps {
  ideas: Idea[]
}

export default function ContentList({ ideas }: ContentListProps) {
  const [expandedIdea, setExpandedIdea] = useState<string | null>(null)

  const getLatestDraft = (idea: Idea) => {
    return idea.contentDrafts[0] || null
  }

  const getDraftStatusColor = (status: string) => {
    switch (status) {
      case DRAFT_STATUS.DRAFT:
        return 'bg-yellow-100 text-yellow-800'
      case DRAFT_STATUS.AWAITING_REVISION:
        return 'bg-orange-100 text-orange-800'
      case DRAFT_STATUS.AWAITING_FEEDBACK:
        return 'bg-blue-100 text-blue-800'
      case DRAFT_STATUS.APPROVED:
        return 'bg-green-100 text-green-800'
      case DRAFT_STATUS.REJECTED:
        return 'bg-red-100 text-red-800'
      case DRAFT_STATUS.PUBLISHED:
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
      {ideas.map((idea) => {
        const latestDraft = getLatestDraft(idea)
        
        return (
          <div key={idea.id} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">{idea.title}</h3>
                <p className="mt-1 text-sm text-gray-500">
                  by {idea.createdBy.name || idea.createdBy.email}
                </p>
              </div>
              {latestDraft && (
                <div className="ml-4 flex-shrink-0">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getDraftStatusColor(latestDraft.status)}`}>
                    {latestDraft.status.replace(/_/g, ' ')}
                  </span>
                </div>
              )}
            </div>

            <p className="mt-3 text-sm text-gray-600">{idea.description}</p>

            <div className="mt-4 flex space-x-4">
              <Link
                href={`/ready-content/${idea.id}/edit`}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                {latestDraft ? 'Edit Draft' : 'Create Draft'}
              </Link>
              
              {latestDraft && (
                <button
                  type="button"
                  onClick={() => setExpandedIdea(expandedIdea === idea.id ? null : idea.id)}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  {expandedIdea === idea.id ? 'Hide Feedback' : 'Show Feedback'}
                </button>
              )}
            </div>

            {expandedIdea === idea.id && latestDraft && (
              <div className="mt-4 space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900">Latest Draft</h4>
                  <div className="mt-2 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: latestDraft.body || 'No content yet' }}
                  />
                </div>

                {latestDraft.feedbacks.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-900">Feedback History</h4>
                    {latestDraft.feedbacks.map((feedback) => (
                      <div key={feedback.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">
                            {feedback.createdBy.name || feedback.createdBy.email}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatDate(new Date(feedback.createdAt))}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">{feedback.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}

      {ideas.length === 0 && (
        <div className="p-6 text-center text-gray-500">
          No approved ideas found
        </div>
      )}
    </div>
  )
} 