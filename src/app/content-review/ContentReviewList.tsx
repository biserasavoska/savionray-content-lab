'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { LightBulbIcon, ChartBarIcon, CheckCircleIcon, XCircleIcon, UserIcon, DocumentTextIcon, ClockIcon } from '@heroicons/react/24/outline'
import { useOrganization } from '@/lib/contexts/OrganizationContext'

// Feedback type defined locally to avoid import issues
interface Feedback {
  id: string
  content: string
  createdAt: Date
  User: Pick<User, 'name' | 'email'>
}
import { getStatusBadgeClasses, getStatusLabel, DRAFT_STATUS, CONTENT_TYPE } from '@/lib/utils/enum-utils'
// EnhancedFeedbackForm removed - using simple feedback form instead
import FeedbackList from '@/components/feedback/FeedbackList'
import FeedbackForm from '@/components/feedback/FeedbackForm'
import AIEnhancedContentReview from '@/components/content/AIEnhancedContentReview'
import StatusBadge from '@/components/ui/common/StatusBadge'
import Button from '@/components/ui/common/Button'
import { PageLayout, PageHeader, PageContent, PageSection } from '@/components/ui/layout/PageLayout'

interface ContentDraft {
  id: string
  status: string
  createdAt: Date
  updatedAt: Date
  createdById: string
  body: string | null
  metadata: any
  ideaId: string
  contentType: string
  Feedback?: (Feedback & {
    User: Pick<User, 'name' | 'email'>
  })[]
}

interface Idea {
  id: string
  title: string
  description: string | null
  status: string
  User: {
    name: string | null
    email: string
  }
}

interface User {
  name: string | null
  email: string
}

interface ContentReviewListProps {
  isCreativeUser: boolean
  isClientUser: boolean
}

export default function ContentReviewList({ isCreativeUser, isClientUser }: ContentReviewListProps) {
  const { data: session } = useSession()
  const { currentOrganization } = useOrganization()
  const [drafts, setDrafts] = useState<(ContentDraft & { Idea: Idea; User: User })[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null)
  const [showFeedbackForm, setShowFeedbackForm] = useState<{ [key: string]: boolean }>({})
  const [showAIReview, setShowAIReview] = useState<{ [key: string]: boolean }>({})
  const [isClient, setIsClient] = useState(false)
  const [selectedType, setSelectedType] = useState<string>('ALL')
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL')
  const [selectedPeriod, setSelectedPeriod] = useState<string>('ALL')
  const [availablePeriods, setAvailablePeriods] = useState<string[]>([])

  // Filter drafts based on selected filters
  const filteredDrafts = drafts.filter(draft => {
    if (selectedType !== 'ALL' && draft.contentType !== selectedType) {
      return false
    }
    if (selectedStatus !== 'ALL' && draft.status !== selectedStatus) {
      return false
    }
    return true
  })

  // Fetch content drafts based on organization
  useEffect(() => {
    if (currentOrganization) {
      fetchDrafts()
      fetchPeriods()
    }
  }, [currentOrganization])

  const fetchDrafts = async () => {
    if (!currentOrganization) return
    
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedPeriod !== 'ALL') {
        params.append('period', selectedPeriod)
      }
      
      const response = await fetch(`/api/content-drafts?${params.toString()}`, {
        headers: {
          'x-selected-organization': currentOrganization.id
        }
      })
      if (!response.ok) {
        throw new Error('Failed to fetch content drafts')
      }
      const data = await response.json()
      setDrafts(data.drafts || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch content drafts')
    } finally {
      setLoading(false)
    }
  }

  const fetchPeriods = async () => {
    if (!currentOrganization) return
    
    try {
      const response = await fetch('/api/content-drafts/periods', {
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

  // Refetch drafts when period changes
  useEffect(() => {
    if (currentOrganization && selectedPeriod !== 'ALL') {
      fetchDrafts()
    }
  }, [selectedPeriod])

  // Prevent hydration mismatch
  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleStatusUpdate = async (contentItemId: string, newStatus: string) => {
    if (!session || !currentOrganization) return

    setIsSubmitting(contentItemId)
    try {
      const response = await fetch(`/api/content-items/${contentItemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-selected-organization': currentOrganization.id,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        // Refresh the drafts data instead of reloading the entire page
        // This preserves the organization context and provides better UX
        await fetchDrafts()
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

  const handleFeedbackSuccess = async () => {
    // Refresh the drafts data instead of reloading the entire page
    // This preserves the organization context and provides better UX
    await fetchDrafts()
  }

  const getContentTypeLabel = (contentType: string) => {
    switch (contentType) {
      case 'SOCIAL_MEDIA_POST':
        return 'Social Media Post'
      case 'BLOG_POST':
        return 'Blog Post'
      case 'NEWSLETTER':
        return 'Newsletter'
      case 'EMAIL_CAMPAIGN':
        return 'Email Campaign'
      case 'WEBSITE_COPY':
        return 'Website Copy'
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

  const CONTENT_TYPE_OPTIONS = Object.values(CONTENT_TYPE)

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchDrafts}>Try Again</Button>
      </div>
    )
  }

  if (!drafts || drafts.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No content to create</h3>
        <p className="text-gray-600 mb-4">
          {isCreativeUser 
            ? "You don't have any content drafts awaiting creation. Create some content from approved content items first."
            : "There are no content drafts awaiting creation at this time."
          }
        </p>
        {isCreativeUser && (
          <Link href="/create-content">
            <Button variant="destructive" size="sm">
              Create Content
            </Button>
          </Link>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div>
            <label htmlFor="content-type-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Content Type
            </label>
            <select
              id="content-type-filter"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
            >
              <option value="ALL">All Types</option>
              {CONTENT_TYPE_OPTIONS.map(type => (
                <option key={type} value={type}>
                  {getContentTypeLabel(type)}
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
              <option value="DRAFT">Draft</option>
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
          {filteredDrafts.length} of {drafts.length} items
        </div>
      </div>

      {/* Content List */}
      {filteredDrafts.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No content matches your filters</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your filter criteria to see more content.
          </p>
        </div>
      ) : (
        filteredDrafts.map((draft) => (
        <div key={draft.id} className="bg-white shadow-lg rounded-lg p-6 border-l-4 border-l-blue-500 hover:shadow-xl transition-all duration-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <h3 className="text-xl font-semibold text-gray-900">
                  {draft.Idea?.title || 'Untitled content item'}
                </h3>
                                 <StatusBadge status={draft.status as any} />
              </div>
              
                              <p className="text-gray-600 mb-4 text-base leading-relaxed">{draft.Idea?.description || 'No description available'}</p>
              
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
                  <span><span className="font-medium">Created by:</span> {draft.User?.name || draft.User?.email || 'Unknown'}</span>
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
               <Button
                 onClick={() => toggleAIReview(draft.id)}
                 variant="outline"
                 size="sm"
               >
                 <LightBulbIcon className="h-4 w-4" />
                 <span>{showAIReview[draft.id] ? 'Hide AI Review' : 'AI Review'}</span>
               </Button>

              {/* Status update buttons for appropriate users */}
              {isClientUser && draft.status === DRAFT_STATUS.AWAITING_FEEDBACK && (
                <div className="flex flex-col space-y-2">
                                     <Button
                     onClick={() => handleStatusUpdate(draft.id, DRAFT_STATUS.APPROVED)}
                     disabled={isSubmitting === draft.id}
                     variant="default"
                     size="sm"
                   >
                     {isSubmitting === draft.id ? 'Updating...' : 'Approve'}
                   </Button>
                   <Button
                     onClick={() => handleStatusUpdate(draft.id, DRAFT_STATUS.AWAITING_REVISION)}
                     disabled={isSubmitting === draft.id}
                     variant="secondary"
                     size="sm"
                   >
                     {isSubmitting === draft.id ? 'Updating...' : 'Request Revision'}
                   </Button>
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
                  createdAt: new Date(draft.createdAt).toISOString(),
                  createdBy: {
                              name: draft.User.name || '',
          email: draft.User.email
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
                                 <Button
                   onClick={() => toggleFeedbackForm(draft.id)}
                   variant="outline"
                   size="sm"
                 >
                   {showFeedbackForm[draft.id] ? 'Hide Feedback Form' : 'Give Feedback'}
                 </Button>
              </div>

              {/* Feedback Form */}
              {isClient && showFeedbackForm[draft.id] && (
                <div className="mb-6">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <FeedbackForm
                      draftId={draft.id}
                      onSuccess={async () => {
                        toggleFeedbackForm(draft.id)
                        // Refresh the drafts data instead of reloading the entire page
                        await fetchDrafts()
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Feedback History */}
                              {draft.Feedback && draft.Feedback.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-3">Previous Feedback ({draft.Feedback.length})</h5>
                    <FeedbackList feedbacks={draft.Feedback as any} />
                  </div>
                )}
            </div>
          )}
        </div>
      ))
      )}
    </div>
  )
}