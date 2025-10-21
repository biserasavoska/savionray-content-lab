'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

import type { ContentDraft, Idea, User, Media, ContentType } from '../../types/content'
import { Feedback } from '@prisma/client'
import { formatDate } from '../../lib/utils/date-helpers'

import { DRAFT_STATUS, CONTENT_TYPE } from '@/lib/utils/enum-utils'
import FeedbackList from '@/components/feedback/FeedbackList'
import FeedbackForm from '@/components/feedback/FeedbackForm'
import StatusBadge from '@/components/ui/common/StatusBadge'
import Button from '@/components/ui/common/Button'
import { PageContent, PageSection } from '@/components/ui/layout/PageLayout'
import { useOrganization } from '@/lib/contexts/OrganizationContext'

interface ReadyContentListProps {
  isCreativeUser: boolean
  isClientUser: boolean
}



export default function ReadyContentList({ isCreativeUser, isClientUser }: ReadyContentListProps) {
  const { data: session } = useSession()
  const { currentOrganization } = useOrganization()
  
  console.log('ReadyContentList render - currentOrganization:', currentOrganization)
  const [content, setContent] = useState<(Omit<ContentDraft, 'status'> & {
    status: string
    Idea: Idea & {
      User: Pick<User, 'name' | 'email'>
    }
    User: Pick<User, 'name' | 'email'>
    Media: Media[]
    Feedback: (Feedback & {
      User: Pick<User, 'name' | 'email'>
    })[]
  })[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<ContentType | 'ALL'>('ALL')
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL')
  const [selectedPeriod, setSelectedPeriod] = useState<string>('ALL')
  const [availablePeriods, setAvailablePeriods] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null)
  const [showFeedbackForm, setShowFeedbackForm] = useState<{ [key: string]: boolean }>({})
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [updatedItems, setUpdatedItems] = useState<Set<string>>(new Set())
  const [unifiedFeedback, setUnifiedFeedback] = useState<{ [key: string]: any[] }>({})
  
  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 4, // Show 4 items initially
    total: 0,
    totalPages: 0
  })
  const [loadingMore, setLoadingMore] = useState(false)

  // Fetch ready content data (initial load only)
  useEffect(() => {
    const fetchContent = async () => {
      if (!currentOrganization) {
        console.log('No current organization, skipping fetch')
        setLoading(false)
        return
      }

      console.log('Fetching content for organization:', currentOrganization.id)
      try {
        setLoading(true)
        setError(null)
        
        const params = new URLSearchParams()
        params.append('page', '1')
        params.append('limit', '4')
        if (selectedPeriod !== 'ALL') {
          params.append('period', selectedPeriod)
        }
        
        const response = await fetch(`/api/ready-content?${params.toString()}`, {
          headers: {
            'x-selected-organization': currentOrganization.id
          }
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('API Error:', response.status, errorText)
          throw new Error(`Failed to fetch ready content: ${response.status} ${errorText}`)
        }
        
        const data = await response.json()
        console.log('Initial load - pagination data:', data.pagination)
        console.log('Initial load - content length:', data.content?.length)
        setContent(data.content || [])
        setPagination(data.pagination || pagination)
      } catch (err) {
        console.error('Error fetching ready content:', err)
        setError('Failed to load ready content')
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
    fetchPeriods()
  }, [currentOrganization])

  // Fetch available periods
  const fetchPeriods = async () => {
    if (!currentOrganization) return
    
    try {
      const response = await fetch('/api/ready-content/periods', {
        headers: {
          'x-selected-organization': currentOrganization.id
        }
      })
      if (response.ok) {
        const data = await response.json()
        setAvailablePeriods(data.periods || [])
        
        // Set default period to the most recent one
        if (data.periods && data.periods.length > 0 && selectedPeriod === 'ALL') {
          setSelectedPeriod(data.periods[0])
        }
      }
    } catch (err) {
      console.error('Failed to fetch periods:', err)
    }
  }

  // Refetch content when period changes
  useEffect(() => {
    if (currentOrganization && selectedPeriod !== 'ALL') {
      const fetchContent = async () => {
        try {
          setLoading(true)
          setError(null)
          
          const params = new URLSearchParams()
          params.append('page', '1')
          params.append('limit', '4')
          if (selectedPeriod !== 'ALL') {
            params.append('period', selectedPeriod)
          }
          
          const response = await fetch(`/api/ready-content?${params.toString()}`, {
            headers: {
              'x-selected-organization': currentOrganization.id
            }
          })
          
          if (!response.ok) {
            const errorText = await response.text()
            console.error('API Error:', response.status, errorText)
            throw new Error(`Failed to fetch ready content: ${response.status} ${errorText}`)
          }
          
          const data = await response.json()
          setContent(data.content || [])
          setPagination(data.pagination || pagination)
        } catch (err) {
          console.error('Error fetching ready content:', err)
          setError('Failed to load ready content')
        } finally {
          setLoading(false)
        }
      }

      fetchContent()
    }
  }, [selectedPeriod])

  const filteredContent = content.filter(item => {
    if (selectedType !== 'ALL' && item.contentType !== selectedType) {
      return false
    }
    if (selectedStatus !== 'ALL' && item.status !== selectedStatus) {
      return false
    }
    return true
  })
  
  console.log('Filtering debug:', {
    totalContent: content.length,
    filteredContent: filteredContent.length,
    selectedStatus,
    selectedType,
    contentStatuses: content.map(item => item.status)
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'Draft'
      case 'AWAITING_FEEDBACK':
        return 'Awaiting Feedback'
      case 'AWAITING_REVISION':
        return 'Awaiting Revision'
      case 'APPROVED':
        return 'Approved'
      case 'REJECTED':
        return 'Rejected'
      case 'PUBLISHED':
        return 'Published'
      default:
        return status.replace(/_/g, ' ')
    }
  }

  const handleStatusUpdate = async (draftId: string, newStatus: string) => {
    if (!session) return

    setIsSubmitting(draftId)
    try {
      let endpoint: string
      let method: string
      
      if (newStatus === 'APPROVED') {
        endpoint = `/api/drafts/${draftId}/approve`
        method = 'POST'
      } else if (newStatus === 'REJECTED') {
        endpoint = `/api/drafts/${draftId}/reject`
        method = 'POST'
      } else {
        // For other status updates, use the general endpoint if it exists
        endpoint = `/api/drafts/${draftId}`
        method = 'PUT'
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        // Show success message
        const statusText = newStatus === 'APPROVED' ? 'approved' : 'revision requested'
        setSuccessMessage(`Content ${statusText} successfully!`)
        
        // Mark item as updated
        setUpdatedItems(prev => new Set(prev).add(draftId))
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000)
        
        // Refresh the page after a short delay to show updated data
        setTimeout(() => {
          window.location.reload()
        }, 1500)
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

  const toggleFeedbackForm = async (itemId: string) => {
    const isOpening = !showFeedbackForm[itemId]
    
    setShowFeedbackForm(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }))

    // Load unified feedback when opening the form
    if (isOpening && !unifiedFeedback[itemId]) {
      const feedback = await fetchUnifiedFeedback(itemId)
      setUnifiedFeedback(prev => ({
        ...prev,
        [itemId]: feedback
      }))
    }
  }

  const handleFeedbackSuccess = async (draftId: string) => {
    // Fetch updated unified feedback for this draft
    const feedback = await fetchUnifiedFeedback(draftId)
    setUnifiedFeedback(prev => ({
      ...prev,
      [draftId]: feedback
    }))
  }

  const fetchUnifiedFeedback = async (draftId: string) => {
    try {
      const response = await fetch(`/api/feedback/unified?draftId=${draftId}`)
      if (response.ok) {
        const data = await response.json()
        return data
      }
    } catch (error) {
      console.error('Error fetching unified feedback:', error)
    }
    return []
  }

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  const CONTENT_TYPE_OPTIONS: ContentType[] = ['NEWSLETTER', 'BLOG_POST', 'SOCIAL_MEDIA_POST', 'EMAIL_CAMPAIGN', 'WEBSITE_COPY']

  // Load more content (load all remaining at once)
  const loadMore = async () => {
    if (loadingMore || content.length >= pagination.total) return

    setLoadingMore(true)
    try {
      // Load all remaining content at once
      const params = new URLSearchParams()
      params.append('page', '1')
      params.append('limit', pagination.total.toString())
      if (selectedPeriod !== 'ALL') {
        params.append('period', selectedPeriod)
      }
      
      const response = await fetch(`/api/ready-content?${params.toString()}`, {
        headers: {
          'x-selected-organization': currentOrganization?.id || ''
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Load more - pagination data:', data.pagination)
        console.log('Load more - content length:', data.content?.length)
        // Replace the current content with all content
        setContent(data.content || [])
        setPagination(prev => ({
          ...prev,
          page: data.pagination.page,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages
        }))
      }
    } catch (error) {
      console.error('Error loading more content:', error)
    } finally {
      setLoadingMore(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 text-gray-400 animate-spin">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
        <h3 className="mt-2 text-lg font-medium text-gray-900">Loading ready content...</h3>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 text-red-400">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="mt-2 text-lg font-medium text-red-900">Error loading content</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    )
  }

  if (!content || content.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 text-gray-400">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="mt-2 text-lg font-medium text-gray-900 mb-2">
          {isClientUser ? 'No content pending review' : 'No ready content'}
        </h3>
        <p className="text-gray-600 mb-4">
          {isCreativeUser 
            ? "You don't have any content ready for publishing yet. Create content from approved ideas first."
            : isClientUser
            ? "All content has been reviewed and approved. New content will appear here when it's ready for your review."
            : "There is no content ready for publishing at this time."
          }
        </p>
        {isCreativeUser && (
          <Link href="/create-content">
            <Button variant="destructive" size="sm">
              Create Content
            </Button>
          </Link>
        )}
        {isClientUser && (
          <Link href="/ideas">
            <Button variant="default" size="sm">
              Review Ideas
            </Button>
          </Link>
        )}
      </div>
    )
  }

  return (
    <PageContent>
        <PageSection>
          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">{successMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div>
                <label htmlFor="content-type-filter" className="block text-sm font-medium text-gray-700 mb-1">
                  Content Type
                </label>
                <select
                  id="content-type-filter"
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
              <div>
                <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status-filter"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                >
                  <option value="ALL">All Statuses</option>
                  {!isClientUser && <option value="DRAFT">Draft</option>}
                  <option value="AWAITING_FEEDBACK">Awaiting Feedback</option>
                  <option value="AWAITING_REVISION">Awaiting Revision</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="PUBLISHED">Published</option>
                </select>
              </div>
              <div>
                <label htmlFor="period-filter" className="block text-sm font-medium text-gray-700 mb-1">
                  Period
                </label>
                <select
                  id="period-filter"
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                >
                  <option value="ALL">All Periods</option>
                  {availablePeriods.map(period => (
                    <option key={period} value={period}>
                      {period}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {filteredContent.length} of {pagination.total} items
            </div>
          </div>

          {/* Content List */}
          <div className="space-y-6">
            {filteredContent.map((item) => (
              <div key={item.id} className="bg-white shadow rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-xl font-bold text-gray-900">
                        {item.Idea?.title || 'Untitled Idea'}
                      </h3>
                      <StatusBadge status={item.status as any} />
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {getContentTypeLabel(item.contentType)}
                      </span>
                      {isClientUser && item.status === 'AWAITING_FEEDBACK' && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Needs Review
                        </span>
                      )}
                    </div>
                    
                    {/* Description Section */}
                    <div className="bg-blue-50 rounded-md p-4 mb-4">
                      <h4 className="text-sm font-semibold text-blue-700 mb-2">Description:</h4>
                      <div className="text-sm text-gray-800 whitespace-pre-wrap">
                        {item.Idea?.description || 'No description available'}
                      </div>
                    </div>
                    
                    {/* Content (Main Post Text) */}
                    <div className="bg-green-50 rounded-md p-4 mb-4">
                      <h4 className="text-sm font-semibold text-green-700 mb-2">Content:</h4>
                      <div 
                        className="text-sm text-gray-800 prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: item.body }}
                      />
                    </div>

                    {/* Additional Details (if present) */}
                    {item.metadata && Object.keys(item.metadata).length > 0 && (
                      <div className="bg-blue-50 rounded-md p-4 mb-4">
                        <h4 className="text-sm font-semibold text-blue-700 mb-2">Additional Details</h4>
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
                        <span className="font-medium">Created by:</span> {item.User?.name || item.User?.email || 'Unknown'}
                      </div>
                      <div>
                        <span className="font-medium">Idea by:</span> {item.Idea?.User?.name || item.Idea?.User?.email || 'Unknown'}
                      </div>
                      <div>
                        <span className="font-medium">Updated:</span> {formatDate(item.updatedAt)}
                      </div>
                      <div>
                        <span className="font-medium">Feedback:</span> {unifiedFeedback[item.id]?.length || item.Feedback?.length || 0} comments
                      </div>
                    </div>

                    {/* Media Attachments */}
                    {item.Media && item.Media.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Attachments:</h4>
                        <div className="flex flex-wrap gap-2">
                          {item.Media.map((media) => (
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
                                     <Link href={`/ready-content/${item.id}/edit`}>
                   <Button variant="outline" size="sm">
                     Edit Content
                   </Button>
                 </Link>

                    {/* Status update buttons for appropriate users */}
                    {isClientUser && item.status === DRAFT_STATUS.AWAITING_FEEDBACK && (
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleStatusUpdate(item.id, DRAFT_STATUS.APPROVED)}
                          disabled={isSubmitting === item.id || updatedItems.has(item.id)}
                          variant="default"
                          size="sm"
                        >
                          {isSubmitting === item.id ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Updating...
                            </>
                          ) : updatedItems.has(item.id) ? (
                            <>
                              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Approved ✓
                            </>
                          ) : (
                            'Approve'
                          )}
                        </Button>
                        <Button
                          onClick={() => handleStatusUpdate(item.id, DRAFT_STATUS.AWAITING_REVISION)}
                          disabled={isSubmitting === item.id || updatedItems.has(item.id)}
                          variant="secondary"
                          size="sm"
                        >
                          {isSubmitting === item.id ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Updating...
                            </>
                          ) : updatedItems.has(item.id) ? (
                            <>
                              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Revision Requested ✓
                            </>
                          ) : (
                            'Request Revision'
                          )}
                        </Button>
                      </div>
                    )}


                  </div>
                </div>

                {/* Feedback Section */}
                <div className="mt-6 border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-gray-900">Feedback</h4>
                    <Button
                      onClick={() => toggleFeedbackForm(item.id)}
                      variant="outline"
                      size="sm"
                    >
                      {showFeedbackForm[item.id] ? 'Hide Feedback Form' : 'Give Feedback'}
                    </Button>
                  </div>

                  {/* Feedback Form */}
                  {showFeedbackForm[item.id] && (
                    <div className="mb-6">
                      <div className="bg-gray-50 p-4 rounded-md">
                          <FeedbackForm
                            draftId={item.id}
                            onSuccess={() => handleFeedbackSuccess(item.id)}
                          />
                      </div>
                    </div>
                  )}

                  {/* Feedback History */}
                  {(item.Feedback && item.Feedback.length > 0) || (unifiedFeedback[item.id] && unifiedFeedback[item.id].length > 0) ? (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-3">
                        All Feedback ({unifiedFeedback[item.id]?.length || item.Feedback?.length || 0})
                      </h5>
                      {unifiedFeedback[item.id] && unifiedFeedback[item.id].length > 0 ? (
                        <div className="space-y-4">
                          {unifiedFeedback[item.id].map((feedback, index) => (
                            <div key={feedback.id || index} className="bg-white border rounded-lg p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium text-gray-900">
                                    {feedback.User?.name || feedback.User?.email || 'Unknown User'}
                                  </span>
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    feedback.source === 'idea' 
                                      ? 'bg-blue-100 text-blue-800' 
                                      : 'bg-green-100 text-green-800'
                                  }`}>
                                    {feedback.source === 'idea' ? 'Idea Stage' : 'Draft Stage'}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {feedback.rating > 0 && (
                                    <div className="flex space-x-1">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <span
                                          key={star}
                                          className={`text-sm ${
                                            star <= feedback.rating
                                              ? 'text-yellow-400'
                                              : 'text-gray-300'
                                          }`}
                                        >
                                          ★
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  <span className="text-xs text-gray-500">
                                    {new Date(feedback.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4 mb-2">
                                <span className="text-xs text-gray-600 capitalize">
                                  {feedback.category}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded ${
                                  feedback.priority === 'high' 
                                    ? 'bg-red-100 text-red-800'
                                    : feedback.priority === 'medium'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {feedback.priority} priority
                                </span>
                                {feedback.actionable && (
                                  <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                                    Action Required
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-700">{feedback.comment}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <FeedbackList feedbacks={item.Feedback} />
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500">No feedback yet.</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {content.length < pagination.total && (
            <div className="text-center mt-8">
              <Button
                onClick={loadMore}
                disabled={loadingMore}
                variant="outline"
                size="lg"
              >
                {loadingMore ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </>
                ) : (
                  `Load All (${pagination.total - content.length} remaining)`
                )}
              </Button>
            </div>
          )}
        </PageSection>
    </PageContent>
  )
} // Test deployment Tue Sep 23 13:19:32 CEST 2025
// Test production deployment Tue Sep 23 13:20:18 CEST 2025
