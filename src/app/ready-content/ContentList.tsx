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
    <div className="space-y-6">
      {ideas.map((idea) => {
        const latestDraft = getLatestDraft(idea)
        
        return (
          <div key={idea.id} className="bg-white shadow-lg rounded-lg p-6 border-l-4 border-l-green-500 hover:shadow-xl transition-all duration-200 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <h3 className="text-xl font-semibold text-gray-900">{idea.title}</h3>
                  {latestDraft && (
                    <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getDraftStatusColor(latestDraft.status)}`}>
                      {latestDraft.status.replace(/_/g, ' ')}
                    </span>
                  )}
                </div>
                
                <p className="text-gray-600 mb-4 text-base leading-relaxed">{idea.description}</p>
                
                {/* AI Insights Section */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-green-800">AI Insights:</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span className="text-sm text-green-700">Ready Score: 9.2/10</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-blue-700">Approved for Creation</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span className="text-sm text-purple-700">High Priority</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span><span className="font-medium">Created by:</span> {idea.createdBy.name || idea.createdBy.email}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span><span className="font-medium">Created:</span> {formatDate(new Date(idea.createdAt))}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-3 ml-6">
                <Link
                  href={`/ready-content/${idea.id}/edit`}
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full"
                >
                  {latestDraft ? 'Edit Draft' : 'Create Draft'}
                </Link>
                
                {latestDraft && (
                  <button
                    type="button"
                    onClick={() => setExpandedIdea(expandedIdea === idea.id ? null : idea.id)}
                    className="inline-flex items-center justify-center px-4 py-2 border border-blue-300 shadow-sm text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full"
                  >
                    {expandedIdea === idea.id ? 'Hide Feedback' : 'Show Feedback'}
                  </button>
                )}
              </div>
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