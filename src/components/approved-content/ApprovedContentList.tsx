'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

import { DRAFT_STATUS } from '@/lib/utils/enum-constants'
import { formatDate } from '@/lib/utils/date-helpers'

interface ApprovedContentListProps {
  content: any[]
  isAdminUser: boolean
  isCreativeUser: boolean
  isClientUser: boolean
}

export default function ApprovedContentList({ content, isAdminUser, isCreativeUser, isClientUser }: ApprovedContentListProps) {
  const { data: session } = useSession()
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null)
  const [expandedContent, setExpandedContent] = useState<Set<string>>(new Set())
  const [showFeedbackForm, setShowFeedbackForm] = useState<{ [key: string]: boolean }>({})

  console.log('ApprovedContentList: Rendering with', {
    contentCount: content.length,
    isAdminUser,
    isCreativeUser,
    isClientUser,
    sessionUser: session?.user?.email
  })

  const getContentTypeLabel = (contentType: string) => {
    switch (contentType) {
      case 'SOCIAL_MEDIA_POST':
        return 'Social Media'
      case 'BLOG_POST':
        return 'Blog Post'
      case 'NEWSLETTER':
        return 'Newsletter'
      case 'WEBSITE_COPY':
        return 'Website Copy'
      case 'EMAIL_CAMPAIGN':
        return 'Email Campaign'
      default:
        return contentType.replace(/_/g, ' ')
    }
  }

  const handlePublish = async (contentItemId: string) => {
    if (!session) return

    setIsSubmitting(contentItemId)
    try {
      const response = await fetch(`/api/content-items/${contentItemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: DRAFT_STATUS.PUBLISHED }),
      })

      if (response.ok) {
        // Refresh the page to show updated data
        window.location.reload()
      } else {
        console.error('Failed to publish content')
        alert('Failed to publish content. Please try again.')
      }
    } catch (error) {
      console.error('Error publishing content:', error)
      alert('Error publishing content. Please try again.')
    } finally {
      setIsSubmitting(null)
    }
  }

  const toggleFeedbackForm = (itemId: string) => {
    setShowFeedbackForm(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }))
  }

  const toggleContentExpansion = (itemId: string) => {
    setExpandedContent(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  if (content.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No approved content</h3>
          <p className="mt-1 text-sm text-gray-500">
            Content that has been approved by clients will appear here.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {content.map((item) => (
        <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Approved
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {getContentTypeLabel(item.contentType)}
                </span>
              </div>

              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {(() => {
                  // Try to get title from idea first
                  if (item.idea?.title) return item.idea.title
                  
                  // Try to extract title from AI content body
                  if (item.body) {
                    const lines = item.body.split('\n')
                    for (const line of lines) {
                      const trimmed = line.trim()
                      // Look for markdown headers (# Title) or first meaningful line
                      if (trimmed.startsWith('# ')) {
                        return trimmed.substring(2).trim()
                      }
                      if (trimmed.startsWith('## ')) {
                        return trimmed.substring(3).trim()
                      }
                      // If no headers, use first non-empty line
                      if (trimmed.length > 0 && !trimmed.startsWith('#')) {
                        return trimmed.length > 50 ? trimmed.substring(0, 50) + '...' : trimmed
                      }
                    }
                  }
                  
                  return 'Untitled Content'
                })()}
              </h3>

              {/* AI Generated Content Section */}
              {item.body && (
                <div className="bg-green-50 rounded-md p-4 mb-4">
                  <h4 className="text-sm font-semibold text-green-700 mb-2">AI Generated Content:</h4>
                  <div className="text-sm text-gray-800 whitespace-pre-wrap">
                    {expandedContent.has(item.id) 
                      ? item.body 
                      : item.body.length > 200 
                        ? item.body.substring(0, 200) + '...' 
                        : item.body
                    }
                  </div>
                  {item.body.length > 200 && (
                    <button
                      onClick={() => toggleContentExpansion(item.id)}
                      className="mt-2 text-sm text-green-600 hover:text-green-800 font-medium"
                    >
                      {expandedContent.has(item.id) ? 'Show Less' : 'Read More'}
                    </button>
                  )}
                </div>
              )}

              {/* Fallback description if no AI content */}
              {!item.body && (
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {item.idea?.description || 'No content available'}
                </p>
              )}

              <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <span className="font-medium">Created by:</span>
                  <span className="ml-1">{item.createdBy?.name || 'Unknown'}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium">Approved:</span>
                  <span className="ml-1">{formatDate(item.updatedAt)}</span>
                </div>
                {item.idea?.createdBy && (
                  <div className="flex items-center">
                    <span className="font-medium">Idea by:</span>
                    <span className="ml-1">{item.idea.createdBy.name}</span>
                  </div>
                )}
              </div>

              {/* Feedback Summary */}
              {item.feedbacks && item.feedbacks.length > 0 && (
                <div className="mb-4 p-3 bg-gray-50 rounded-md">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Client Feedback</h4>
                  <div className="space-y-2">
                    {item.feedbacks.slice(0, 2).map((feedback: any) => (
                      <div key={feedback.id} className="text-sm text-gray-600">
                        <span className="font-medium">{feedback.createdBy?.name}:</span>
                        <span className="ml-1">{feedback.comment}</span>
                      </div>
                    ))}
                    {item.feedbacks.length > 2 && (
                      <p className="text-xs text-gray-500">
                        +{item.feedbacks.length - 2} more feedback items
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col space-y-2 ml-4">
              <Link
                href={`/ready-content/${item.id}`}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                View Content
              </Link>

              {/* Publish button for admins */}
              {isAdminUser && (
                <button
                  onClick={() => handlePublish(item.id)}
                  disabled={isSubmitting === item.id}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting === item.id ? 'Publishing...' : 'Publish'}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 