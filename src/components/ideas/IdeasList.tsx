'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader } from '@/components/ui/common/Card'
import Badge from '@/components/ui/common/Badge'
import StatusBadge from '@/components/ui/common/StatusBadge'
import Button from '@/components/ui/common/Button'
import { PlusIcon, EyeIcon, PencilIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useOrganization } from '@/lib/contexts/OrganizationContext'

interface Idea {
  id: string
  title: string
  description: string
  status: string
  contentType: string
  mediaType: string
  createdAt: string
  User: {
    name: string
    email: string
  }
  publishingDateTime?: string
  savedForLater: boolean
}

export default function IdeasList() {
  const { data: session } = useSession()
  const { currentOrganization } = useOrganization()
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9,
    total: 0,
    totalPages: 0,
    hasMore: false
  })
  const [loadingMore, setLoadingMore] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<string>('PENDING')
  const [selectedContentType, setSelectedContentType] = useState<string>('ALL')
  const [selectedPeriod, setSelectedPeriod] = useState<string>('ALL')
  const [availablePeriods, setAvailablePeriods] = useState<Array<{ value: string; label: string; count: number }>>([])
  const [latestPeriod, setLatestPeriod] = useState<string | null>(null)
  const [hasSetInitialPeriod, setHasSetInitialPeriod] = useState(false)

  useEffect(() => {
    if (currentOrganization) {
      fetchIdeas()
      fetchAvailablePeriods()
    }
  }, [currentOrganization, selectedStatus, selectedContentType, selectedPeriod])

  const fetchIdeas = async (page = 1, append = false, customLimit?: number) => {
    if (!currentOrganization) return
    
    try {
      if (append) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }
      
      const limit = customLimit || pagination.limit
      const statusParam = selectedStatus !== 'ALL' ? `&status=${selectedStatus}` : ''
      const contentTypeParam = selectedContentType !== 'ALL' ? `&contentType=${selectedContentType}` : ''
      const periodParam = selectedPeriod !== 'ALL' ? `&period=${selectedPeriod}` : ''
      const response = await fetch(`/api/ideas?page=${page}&limit=${limit}${statusParam}${contentTypeParam}${periodParam}`, {
        headers: {
          'x-selected-organization': currentOrganization.id
        }
      })
      if (!response.ok) {
        throw new Error('Failed to fetch ideas')
      }
      const data = await response.json()
      
      if (append) {
        setIdeas(prev => {
          const existingIds = new Set(prev.map((idea: Idea) => idea.id))
          const newIdeas = (data.ideas || []).filter((idea: Idea) => !existingIds.has(idea.id))
          return [...prev, ...newIdeas]
        })
      } else {
        setIdeas(data.ideas || [])
      }
      
      setPagination({
        page: data.pagination.page,
        limit: data.pagination.limit,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages,
        hasMore: append ? false : data.pagination.page < data.pagination.totalPages // Hide "Load More" after loading all
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch ideas')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const loadMore = async () => {
    if (pagination.hasMore && !loadingMore) {
      setLoadingMore(true)
      try {
        // Load all remaining ideas at once
        const statusParam = selectedStatus !== 'ALL' ? `&status=${selectedStatus}` : ''
        const contentTypeParam = selectedContentType !== 'ALL' ? `&contentType=${selectedContentType}` : ''
        const periodParam = selectedPeriod !== 'ALL' ? `&period=${selectedPeriod}` : ''
        const response = await fetch(`/api/ideas?page=1&limit=${pagination.total}${statusParam}${contentTypeParam}${periodParam}`, {
          headers: {
            'x-selected-organization': currentOrganization!.id
          }
        })
        if (!response.ok) {
          throw new Error('Failed to fetch all ideas')
        }
        const data = await response.json()
        
        // Replace the current ideas with all ideas
        setIdeas(data.ideas || [])
        setPagination(prev => ({
          ...prev,
          hasMore: false // Hide the button after loading all
        }))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch all ideas')
      } finally {
        setLoadingMore(false)
      }
    }
  }

  const fetchAvailablePeriods = async () => {
    if (!currentOrganization) return
    
    try {
      const response = await fetch('/api/ideas/periods', {
        headers: {
          'x-selected-organization': currentOrganization.id
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch available periods')
      }
      
      const data = await response.json()
      setAvailablePeriods(data.periods || [])
      setLatestPeriod(data.latestPeriod)
      
      // Only set the default period to the latest period if this is the initial load
      // and we haven't set an initial period yet
      if (data.latestPeriod && !hasSetInitialPeriod) {
        setSelectedPeriod(data.latestPeriod)
        setHasSetInitialPeriod(true)
      }
    } catch (err) {
      console.error('Error fetching available periods:', err)
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'success'
      case 'pending':
        return 'warning'
      case 'rejected':
        return 'danger'
      case 'draft':
        return 'info'
      default:
        return 'default'
    }
  }

  const getContentTypeColor = (contentType: string) => {
    switch (contentType) {
      case 'SOCIAL_MEDIA_POST':
        return 'bg-blue-100 text-blue-800'
      case 'NEWSLETTER':
        return 'bg-green-100 text-green-800'
      case 'BLOG_POST':
        return 'bg-purple-100 text-purple-800'
      case 'WEBSITE_COPY':
        return 'bg-orange-100 text-orange-800'
      case 'EMAIL_CAMPAIGN':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getContentTypeLabel = (contentType: string) => {
    switch (contentType) {
      case 'SOCIAL_MEDIA_POST':
        return 'Social Media Post'
      case 'NEWSLETTER':
        return 'Newsletter'
      case 'BLOG_POST':
        return 'Blog Post'
      case 'WEBSITE_COPY':
        return 'Website Copy'
      case 'EMAIL_CAMPAIGN':
        return 'Email Campaign'
      default:
        return contentType || 'Unknown'
    }
  }

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
        <Button onClick={() => fetchIdeas()}>Try Again</Button>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Ideas</h1>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <label htmlFor="content-type-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Content Type
              </label>
              <select
                id="content-type-filter"
                value={selectedContentType}
                onChange={(e) => setSelectedContentType(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
              >
                <option value="ALL">All Types</option>
                <option value="SOCIAL_MEDIA_POST">Social Media Post</option>
                <option value="NEWSLETTER">Newsletter</option>
                <option value="BLOG_POST">Blog Post</option>
                <option value="WEBSITE_COPY">Website Copy</option>
                <option value="EMAIL_CAMPAIGN">Email Campaign</option>
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
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
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
                {availablePeriods.map((period) => (
                  <option key={period.value} value={period.value}>
                    {period.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              {ideas.length} of {pagination.total} items
            </span>
            <Link href="/ideas/new">
              <Button className="flex items-center space-x-2">
                <PlusIcon className="h-4 w-4" />
                <span>New Idea</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {ideas.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No ideas yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first content idea.
          </p>
          <div className="mt-6">
            <Link href="/ideas/new">
              <Button>Create Idea</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ideas.map((idea) => (
            <Card key={idea.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {idea.title}
                  </h3>
                  <StatusBadge status={idea.status as any} size="sm" />
                </div>
                
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getContentTypeColor(idea.contentType)}`}>
                    {getContentTypeLabel(idea.contentType)}
                  </span>
                  {idea.mediaType && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                      {idea.mediaType}
                    </span>
                  )}
                  {idea.savedForLater && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                      Saved
                    </span>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                  {idea.description}
                </p>
                
                <div className="space-y-2 text-xs text-gray-500 mb-4">
                  <div className="flex justify-between">
                    <span>Created by:</span>
                    <span className="font-medium">{idea.User?.name || idea.User?.email || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Created:</span>
                    <span>{new Date(idea.createdAt).toLocaleDateString('en-US')}</span>
                  </div>
                  {idea.publishingDateTime && (
                    <div className="flex justify-between">
                      <span>Publish:</span>
                      <span>{new Date(idea.publishingDateTime).toLocaleDateString('en-US')}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <Link href={`/ideas/${idea.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      <EyeIcon className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </Link>
                  
                  <Link href={`/ideas/${idea.id}/edit`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      <PencilIcon className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Load More Button */}
      {pagination.hasMore && ideas.length < pagination.total && (
        <div className="mt-8 text-center">
          <Button 
            onClick={loadMore} 
            disabled={loadingMore}
            className="px-8 py-3"
          >
            {loadingMore ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Loading...
              </>
            ) : (
              `Load All Remaining (${pagination.total - ideas.length} ideas)`
            )}
          </Button>
        </div>
      )}
    </div>
  )
}