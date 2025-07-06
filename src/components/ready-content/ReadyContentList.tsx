'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import type { ContentDraft, Idea, User, Media, ContentType } from '../../types/content'
import { formatDate } from '../../lib/utils/date-helpers'

interface ReadyContentListProps {
  content: (Omit<ContentDraft, 'status'> & {
    status: string
    idea: Idea & {
      createdBy: Pick<User, 'name' | 'email'>
    }
    createdBy: Pick<User, 'name' | 'email'>
    media: Media[]
    feedbacks: (Feedback & {
      createdBy: Pick<User, 'name' | 'email'>
    })[]
  })[]
  isCreativeUser: boolean
  isClientUser: boolean
}

// Local Feedback type for this file
type Feedback = {
  id: string
  comment: string
  createdAt: Date
  contentDraftId: string
  createdById: string
}

export default function ReadyContentList({ content, isCreativeUser, isClientUser }: ReadyContentListProps) {
  const { data: session } = useSession()
  const [selectedType, setSelectedType] = useState<ContentType | 'ALL'>('ALL')
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null)

  console.log('ReadyContentList: Rendering with', {
    contentCount: content.length,
    isCreativeUser,
    isClientUser,
    sessionUser: session?.user?.email
  })

  const filteredContent = content.filter(item => {
    if (selectedType !== 'ALL' && item.contentType !== selectedType) {
      return false
    }
    return true
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800'
      case 'AWAITING_FEEDBACK':
        return 'bg-yellow-100 text-yellow-800'
      case 'PUBLISHED':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'Ready to Publish'
      case 'AWAITING_FEEDBACK':
        return 'Awaiting Review'
      case 'PUBLISHED':
        return 'Published'
      default:
        return status.replace(/_/g, ' ')
    }
  }

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

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  const CONTENT_TYPE_OPTIONS: ContentType[] = ['NEWSLETTER', 'BLOG_POST', 'SOCIAL_MEDIA_POST', 'EMAIL_CAMPAIGN', 'WEBSITE_COPY']

  if (!content || content.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 text-gray-400">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="mt-2 text-lg font-medium text-gray-900 mb-2">No ready content</h3>
        <p className="text-gray-600 mb-4">
          {isCreativeUser 
            ? "You don't have any content ready for publishing yet. Create content from approved ideas first."
            : "There is no content ready for publishing at this time."
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
      {/* Filter Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as ContentType | 'ALL')}
            className="rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
          >
            <option value="ALL">All Types</option>
            {CONTENT_TYPE_OPTIONS.map(type => (
              <option key={type} value={type}>
                {type.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
        <div className="text-sm text-gray-500">
          {filteredContent.length} of {content.length} items
        </div>
      </div>

      {/* Content List */}
      <div className="space-y-6">
        {filteredContent.map((item) => (
          <div key={item.id} className="bg-white shadow rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <h3 className="text-lg font-medium text-gray-900">
                    {item.idea?.title || 'Untitled Idea'}
                  </h3>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.status)}`}>
                    {getStatusLabel(item.status)}
                  </span>
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {getContentTypeLabel(item.contentType)}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4">{item.idea?.description || 'No description available'}</p>
                
                {/* AI Generated Content (Main Post Text) */}
                <div className="bg-green-50 rounded-md p-4 mb-4">
                  <h4 className="text-sm font-semibold text-green-700 mb-2">AI Generated Content:</h4>
                  <div className="text-sm text-gray-800 whitespace-pre-wrap">
                    {item.body}
                  </div>
                </div>

                {/* Additional AI Details (if present) */}
                {item.metadata && Object.keys(item.metadata).length > 0 && (
                  <div className="bg-blue-50 rounded-md p-4 mb-4">
                    <h4 className="text-sm font-semibold text-blue-700 mb-2">Additional AI Details</h4>
                    <div className="space-y-2">
                      {/* Model Info */}
                      {item.metadata.model && (
                        <div>
                          <span className="font-medium text-gray-700">Model:</span>
                          <span className="ml-2 text-sm text-gray-600">{item.metadata.model}</span>
                        </div>
                      )}
                      
                      {/* Hashtags */}
                      {Array.isArray(item.metadata.hashtags) && item.metadata.hashtags.length > 0 && (
                        <div>
                          <span className="font-medium text-gray-700">Hashtags:</span>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {item.metadata.hashtags.map((tag: string, idx: number) => (
                              <span key={typeof tag === 'string' ? tag : idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                #{typeof tag === 'string' ? tag : ''}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Call to Action */}
                      {item.metadata.callToAction && (
                        <div>
                          <span className="font-medium text-gray-700">Call to Action:</span>
                          <div className="mt-1 text-sm text-gray-600">{item.metadata.callToAction}</div>
                        </div>
                      )}
                      
                      {/* Additional Context */}
                      {item.metadata.additionalContext && (
                        <div>
                          <span className="font-medium text-gray-700">Additional Context:</span>
                          <div className="mt-1 text-sm text-gray-600">{item.metadata.additionalContext}</div>
                        </div>
                      )}
                      
                      {/* Reasoning Information */}
                      {item.metadata.reasoning && (
                        <div>
                          <span className="font-medium text-gray-700">AI Reasoning:</span>
                          <div className="mt-1 text-sm text-gray-600">
                            {item.metadata.reasoning.summary && (
                              <div className="mb-2">
                                <span className="font-medium">Summary:</span> {item.metadata.reasoning.summary}
                              </div>
                            )}
                            {item.metadata.reasoning.reasoningId && (
                              <div className="mb-2">
                                <span className="font-medium">Reasoning ID:</span> {item.metadata.reasoning.reasoningId}
                              </div>
                            )}
                            {item.metadata.reasoning.encryptedContent && (
                              <div>
                                <span className="font-medium">Encrypted Reasoning:</span> Available
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Platform */}
                      {item.metadata.platform && (
                        <div>
                          <span className="font-medium text-gray-700">Platform:</span>
                          <span className="ml-2 text-sm text-gray-600">{item.metadata.platform}</span>
                        </div>
                      )}
                      
                      {/* Target Audience */}
                      {item.metadata.targetAudience && (
                        <div>
                          <span className="font-medium text-gray-700">Target Audience:</span>
                          <span className="ml-2 text-gray-600">{item.metadata.targetAudience}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-500 mb-4">
                  <div>
                    <span className="font-medium">Created by:</span> {item.createdBy?.name || item.createdBy?.email || 'Unknown'}
                  </div>
                  <div>
                    <span className="font-medium">Idea by:</span> {item.idea.createdBy?.name || item.idea.createdBy?.email || 'Unknown'}
                  </div>
                  <div>
                    <span className="font-medium">Updated:</span> {formatDate(item.updatedAt)}
                  </div>
                  <div>
                    <span className="font-medium">Feedback:</span> {item.feedbacks.length} comments
                  </div>
                </div>

                {/* Media Attachments */}
                {item.media.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Attachments:</h4>
                    <div className="flex flex-wrap gap-2">
                      {item.media.map((media) => (
                        <div key={media.id} className="flex items-center space-x-2 bg-gray-100 rounded-md px-3 py-1">
                          <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          <span className="text-xs text-gray-600">{media.filename}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col space-y-2 ml-4">
                <Link
                  href={`/ready-content/${item.id}/edit`}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Edit Content
                </Link>

                {/* Status update buttons for appropriate users */}
                {isClientUser && item.status === 'AWAITING_FEEDBACK' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleStatusUpdate(item.id, 'APPROVED')}
                      disabled={isSubmitting === item.id}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting === item.id ? 'Updating...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(item.id, 'AWAITING_REVISION')}
                      disabled={isSubmitting === item.id}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting === item.id ? 'Updating...' : 'Request Revision'}
                    </button>
                  </div>
                )}

                {item.status === 'APPROVED' && (
                  <button
                    onClick={() => handleStatusUpdate(item.id, 'PUBLISHED')}
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
    </div>
  )
} 