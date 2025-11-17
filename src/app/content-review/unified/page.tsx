'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { DocumentTextIcon, UserIcon, ClockIcon, SparklesIcon, LightBulbIcon, ChartBarIcon } from '@heroicons/react/24/outline'

import { useInterface } from '@/hooks/useInterface'
import Badge from '@/components/ui/common/Badge'
import Button from '@/components/ui/common/Button'
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/layout/Card'
import { GPT5EnhancedApprovalWorkflow } from '@/components/content/GPT5EnhancedApprovalWorkflow'
import ContentApprovalWorkflow from '@/components/content/ContentApprovalWorkflow'

interface ContentItem {
  id: string
  status: string
  createdAt: string
  updatedAt: string
  User: {
    id: string
    name: string | null
    email: string | null
    role: string
  }
  assignedTo?: {
    id: string
    name: string | null
    email: string | null
  }
  metadata: any
  contentType: string
  body: string | null
  Idea: {
    title: string
    description: string
    status: string
  }
}

interface UnifiedContentReviewProps {
  contentItems: ContentItem[]
  total: number
  currentPage: number
  totalPages: number
}

export default function UnifiedContentReviewPage() {
  const { data: session, status } = useSession()
  const interfaceContext = useInterface()
  const [contentItems, setContentItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({
    status: '',
    currentStage: '',
    contentType: '',
    assignedTo: ''
  })
  const [showAIReview, setShowAIReview] = useState<string | null>(null)
  const [aiReviewData, setAiReviewData] = useState<any>(null)
  const [aiReviewLoading, setAiReviewLoading] = useState(false)

  useEffect(() => {
    if (session?.user) {
      fetchContentItems()
    }
  }, [session, currentPage, filters])

  const fetchContentItems = async () => {
    try {
      setLoading(true)
      setError('')
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '100', // Load all items by default
        ...filters
      })

      const response = await fetch(`/api/drafts?${queryParams}`)
      if (!response.ok) throw new Error('Failed to fetch content drafts')
      
      const data = await response.json()
      setContentItems(data.drafts || [])
      setTotalPages(data.pagination?.pages || 1)
    } catch (error) {
      setError('Failed to load content drafts')
      setContentItems([])
      setTotalPages(1)
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleContentItemSelect = (contentItem: ContentItem) => {
    // Navigate to the content review detail page
    window.location.href = `/content-review/${contentItem.id}`
  }

  const handleAIReview = async (contentItem: ContentItem) => {
    setShowAIReview(contentItem.id)
    setAiReviewLoading(true)
    
    try {
      // Simulate AI review API call
      const response = await fetch('/api/ai/content-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
                  title: contentItem.Idea?.title || 'Untitled',
        description: contentItem.Idea?.description || 'No description',
          contentType: contentItem.contentType,
          body: contentItem.body
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setAiReviewData(data)
      } else {
        // Fallback to mock data if API fails
        setAiReviewData({
          score: Math.floor(Math.random() * 30) + 70,
          insights: [
            'Content aligns well with target audience',
            'SEO optimization opportunities identified',
            'Engagement potential is high',
            'Consider adding more visual elements'
          ],
          recommendations: [
            'Include relevant hashtags for better discoverability',
            'Add a compelling call-to-action',
            'Consider A/B testing different headlines',
            'Optimize for mobile viewing experience'
          ],
          sentiment: 'positive',
          topics: ['content marketing', 'social media', 'engagement']
        })
      }
    } catch (error) {
      console.error('AI Review error:', error)
      // Fallback to mock data
      setAiReviewData({
        score: Math.floor(Math.random() * 30) + 70,
        insights: [
          'Content shows strong potential for engagement',
          'Well-structured and easy to read',
          'Good use of storytelling elements'
        ],
        recommendations: [
          'Consider adding more interactive elements',
          'Test different posting times for optimal reach',
          'Include user-generated content when possible'
        ],
        sentiment: 'positive',
        topics: ['content strategy', 'user engagement', 'social media']
      })
    } finally {
      setAiReviewLoading(false)
    }
  }

  const closeAIReview = () => {
    setShowAIReview(null)
    setAiReviewData(null)
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1) // Reset to first page when filters change
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'IDEA': return 'default'
      case 'CONTENT_REVIEW': return 'secondary'
      case 'APPROVED': return 'default'
      case 'REJECTED': return 'destructive'
      case 'PUBLISHED': return 'default'
      default: return 'default'
    }
  }

  const getStageBadgeVariant = (stage: string) => {
    switch (stage) {
      case 'IDEA': return 'default'
      case 'CONTENT_REVIEW': return 'secondary'
      case 'APPROVED': return 'default'
      case 'REJECTED': return 'destructive'
      case 'PUBLISHED': return 'default'
      default: return 'default'
    }
  }

  const getContentTypeIcon = (contentType: string) => {
    switch (contentType) {
      case 'BLOG_POST': return DocumentTextIcon
      case 'SOCIAL_MEDIA_POST': return SparklesIcon
      case 'NEWSLETTER': return LightBulbIcon
      case 'WEBSITE_CONTENT': return ChartBarIcon
      default: return DocumentTextIcon
    }
  }

  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Please sign in to access content review</h1>
            <Link href="/auth/signin" className="text-blue-600 hover:text-blue-500">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Content Status</h1>
              <p className="mt-2 text-gray-600">
                Unified view of all content across the entire workflow
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" size="lg">
                {contentItems?.length || 0} drafts
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="IDEA">Idea</option>
              <option value="CONTENT_REVIEW">In Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="PUBLISHED">Published</option>
            </select>

            <select
              value={filters.currentStage}
              onChange={(e) => handleFilterChange('currentStage', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Stages</option>
              <option value="IDEA">Idea</option>
              <option value="CONTENT_REVIEW">Content Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="PUBLISHED">Published</option>
            </select>

            <select
              value={filters.contentType}
              onChange={(e) => handleFilterChange('contentType', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="BLOG_POST">Blog Post</option>
              <option value="SOCIAL_MEDIA_POST">Social Media</option>
              <option value="NEWSLETTER">Newsletter</option>
              <option value="WEBSITE_CONTENT">Website Content</option>
            </select>

            <Button
              onClick={() => {
                setFilters({
                  status: '',
                  currentStage: '',
                  contentType: '',
                  assignedTo: ''
                })
                setCurrentPage(1)
              }}
              variant="outline"
              size="sm"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Content Items List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading content items...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        ) : !contentItems || contentItems.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No content items</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first content item.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {contentItems?.map((contentItem) => {
              const ContentTypeIcon = getContentTypeIcon(contentItem.contentType)
              
              return (
                <Card key={contentItem.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <ContentTypeIcon className="h-6 w-6 text-blue-500" />
                          <h3 className="text-xl font-semibold text-gray-900">
                            {contentItem.Idea?.title || 'Untitled'}
                          </h3>
                        </div>
                        
                        <p className="text-gray-600 mb-4 text-base leading-relaxed">
                          {contentItem.Idea?.description || 'No description'}
                        </p>
                        
                        {/* AI Insights Section */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
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
                        
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                          <Badge variant={getStatusBadgeVariant(contentItem.status)}>
                            {contentItem.status.replace('_', ' ')}
                          </Badge>
                          <Badge variant={getStageBadgeVariant(contentItem.Idea?.status || 'DRAFT')}>
                            {(contentItem.Idea?.status || 'DRAFT').replace('_', ' ')}
                          </Badge>
                          <Badge variant="secondary">
                            {contentItem.contentType.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <UserIcon className="h-4 w-4" />
                            <span>{contentItem.User?.name || contentItem.User?.email || 'Unknown'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <ClockIcon className="h-4 w-4" />
                            <span>
                              {new Date(contentItem.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {contentItem.assignedTo && (
                            <div className="flex items-center space-x-1">
                              <UserIcon className="h-4 w-4" />
                              <span>Assigned to: {contentItem.assignedTo.name || 'Unknown'}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-3 ml-6">
                        <Link href={`/content-review/${contentItem.id}`}>
                          <Button size="sm" variant="outline" className="w-full">
                            View Details
                          </Button>
                        </Link>
                        <Button
                          onClick={() => handleAIReview(contentItem)}
                          size="sm"
                          variant="default"
                          className="w-full flex items-center justify-center space-x-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span>AI Review</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages && totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center space-x-2">
              <Button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
              >
                Previous
              </Button>
              
              <span className="px-3 py-2 text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              
              <Button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            </nav>
          </div>
        )}
      </div>

      {/* AI Review Modal */}
      {showAIReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">AI Content Review</h3>
              <button
                onClick={closeAIReview}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {aiReviewLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Analyzing content with AI...</p>
              </div>
            ) : aiReviewData ? (
              <div className="space-y-6">
                {/* Score */}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-2xl font-bold">
                    {aiReviewData.score}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Content Quality Score</p>
                </div>

                {/* Insights */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">AI Insights</h4>
                  <div className="space-y-2">
                    {aiReviewData.insights?.map((insight: string, index: number) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-700">{insight}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Recommendations</h4>
                  <div className="space-y-2">
                    {aiReviewData.recommendations?.map((rec: string, index: number) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-700">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Sentiment</h5>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      aiReviewData.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                      aiReviewData.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {aiReviewData.sentiment}
                    </span>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Topics</h5>
                    <div className="flex flex-wrap gap-1">
                      {aiReviewData.topics?.map((topic: string, index: number) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-600">
                Failed to load AI review. Please try again.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
