'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

import { DRAFT_STATUS } from '@/lib/utils/enum-constants'
import { formatDate } from '@/lib/utils/date-helpers'
import { useOrganization } from '@/lib/contexts/OrganizationContext'

interface ApprovedContentListProps {
  isAdminUser: boolean
  isCreativeUser: boolean
  isClientUser: boolean
}

export default function ApprovedContentList({ isAdminUser, isCreativeUser, isClientUser }: ApprovedContentListProps) {
  const { data: session } = useSession()
  const { currentOrganization } = useOrganization()
  const [content, setContent] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null)
  const [expandedContent, setExpandedContent] = useState<Set<string>>(new Set())
  const [showFeedbackForm, setShowFeedbackForm] = useState<{ [key: string]: boolean }>({})

  // Fetch approved content data
  useEffect(() => {
    const fetchContent = async () => {
      if (!currentOrganization) {
        console.log('No current organization, skipping fetch')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        console.log('Fetching approved content for organization:', currentOrganization.id)
        
        const response = await fetch('/api/approved', {
          headers: {
            'x-selected-organization': currentOrganization.id
          }
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('API error:', response.status, errorText)
          throw new Error(`Failed to fetch approved content: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('Approved content data:', data)
        setContent(data.content || [])
      } catch (err) {
        console.error('Error fetching approved content:', err)
        setError('Failed to load approved content')
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [currentOrganization])

  console.log('ApprovedContentList: Rendering with', {
    contentCount: content?.length || 0,
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
        return contentType?.replace(/_/g, ' ') || 'Unknown'
    }
  }

  const handlePublish = async (contentDraftId: string) => {
    if (!session) return

    // For now, we'll publish to LinkedIn by default
    // In the future, you could add a modal to select platforms
    const platforms = ['linkedin']

    setIsSubmitting(contentDraftId)
    try {
      // Use the new social media publish endpoint
      const response = await fetch(`/api/drafts/${contentDraftId}/publish-social`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ platforms })
      })

      if (response.ok) {
        const result = await response.json()
        
        // Show detailed success message with platform results
        const successMessage = result.results
          .filter((r: any) => r.success)
          .map((r: any) => `✅ ${r.platform.toUpperCase()}: ${r.url}`)
          .join('\n')
        
        alert(`Content published successfully!\n\n${successMessage}`)
        
        // Refresh the page to show updated data
        window.location.reload()
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Failed to publish content:', errorData)
        alert(`Failed to publish content: ${errorData.error || 'Unknown error'}`)
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

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-gray-400 animate-spin">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Loading approved content...</h3>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-red-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-red-900">Error loading content</h3>
          <p className="mt-1 text-sm text-red-600">{error}</p>
          <p className="mt-1 text-xs text-gray-500">
            Current organization: {currentOrganization?.name || 'None selected'}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!content || content.length === 0) {
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
      {content?.map((item) => (
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
                  <div className="text-sm text-gray-800 prose prose-sm max-w-none">
                    {expandedContent.has(item.id) ? (
                      <div dangerouslySetInnerHTML={{ __html: item.body }} />
                    ) : (
                      <div>
                        <div 
                          dangerouslySetInnerHTML={{ 
                            __html: item.body.length > 200 
                              ? item.body.substring(0, 200) + '...' 
                              : item.body 
                          }} 
                        />
                      </div>
                    )}
                  </div>
                  {(item.body?.length || 0) > 200 && (
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
                  <span className="ml-1">{item.updatedAt ? formatDate(item.updatedAt) : 'Unknown date'}</span>
                </div>
                {item.idea?.createdBy && (
                  <div className="flex items-center">
                    <span className="font-medium">Idea by:</span>
                    <span className="ml-1">{item.idea.createdBy?.name || 'Unknown'}</span>
                  </div>
                )}
              </div>

              {/* Feedback Summary */}
              {item.feedbacks && (item.feedbacks?.length || 0) > 0 && (
                <div className="mb-4 p-3 bg-gray-50 rounded-md">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Client Feedback</h4>
                  <div className="space-y-2">
                    {item.feedbacks.slice(0, 2).map((feedback: any) => (
                      <div key={feedback.id} className="text-sm text-gray-600">
                        <span className="font-medium">{feedback.createdBy?.name}:</span>
                        <span className="ml-1">{feedback.comment}</span>
                      </div>
                    ))}
                    {(item.feedbacks?.length || 0) > 2 && (
                      <p className="text-xs text-gray-500">
                        +{(item.feedbacks?.length || 0) - 2} more feedback items
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
                <div className="text-center">
                  <button
                    onClick={() => handlePublish(item.id)}
                    disabled={isSubmitting === item.id}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting === item.id ? 'Publishing...' : 'Publish to LinkedIn'}
                  </button>
                  <p className="text-xs text-gray-500 mt-1">
                    Publishes content directly to LinkedIn
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 