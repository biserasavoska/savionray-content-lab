'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { formatDistanceToNow } from 'date-fns'
import { useOrganization } from '@/lib/contexts/OrganizationContext'
import { 
  StarIcon, 
  ChatBubbleLeftIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  FunnelIcon,
  ArrowTopRightOnSquareIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'

import Button from '@/components/ui/common/Button'
import Badge from '@/components/ui/common/Badge'

interface Feedback {
  id: string
  comment: string
  rating: number
  category: string
  priority: 'low' | 'medium' | 'high'
  actionable: boolean
  createdAt: string
  createdBy: {
    name: string
    email: string
  }
  targetType: 'idea' | 'content'
  targetTitle: string
  targetId: string
  feedbackType: 'idea' | 'content'
  contentDraftId?: string
  ideaId?: string
}

interface FeedbackStats {
  total: number
  averageRating: number
  actionable: number
  highPriority: number
  byCategory: Record<string, number>
}

export default function FeedbackManagementDashboard() {
  const { data: session } = useSession()
  const { currentOrganization } = useOrganization()
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [stats, setStats] = useState<FeedbackStats>({
    total: 0,
    averageRating: 0,
    actionable: 0,
    highPriority: 0,
    byCategory: {}
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    category: 'all',
    priority: 'all',
    actionable: 'all',
    rating: 'all'
  })

  useEffect(() => {
    if (session?.user && currentOrganization) {
      fetchFeedbacks()
    }
  }, [session?.user, currentOrganization])

  const fetchFeedbacks = async () => {
    if (!currentOrganization) return
    
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/feedback/management', {
        headers: {
          'x-selected-organization': currentOrganization.id
        }
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setFeedbacks(data.feedbacks || [])
      setStats(data.stats || {
        total: 0,
        averageRating: 0,
        actionable: 0,
        highPriority: 0,
        byCategory: {}
      })
    } catch (error) {
      console.error('Error fetching feedbacks:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch feedback')
    } finally {
      setLoading(false)
    }
  }

  const filteredFeedbacks = feedbacks.filter(feedback => {
    if (filters.category !== 'all' && feedback.category !== filters.category) return false
    if (filters.priority !== 'all' && feedback.priority !== filters.priority) return false
    if (filters.actionable !== 'all') {
      const actionable = filters.actionable === 'true'
      if (feedback.actionable !== actionable) return false
    }
    if (filters.rating !== 'all') {
      const rating = parseInt(filters.rating)
      if (feedback.rating !== rating) return false
    }
    return true
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'content': return 'bg-blue-100 text-blue-800'
      case 'design': return 'bg-purple-100 text-purple-800'
      case 'technical': return 'bg-orange-100 text-orange-800'
      case 'strategy': return 'bg-indigo-100 text-indigo-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className="inline-block">
        {i < rating ? (
          <StarSolidIcon className="h-4 w-4 text-yellow-400" />
        ) : (
          <StarIcon className="h-4 w-4 text-gray-300" />
        )}
      </span>
    ))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading feedback data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">Error loading feedback: {error}</p>
          <Button onClick={fetchFeedbacks} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Feedback Management
        </h1>
        <p className="text-gray-600 mt-1">
          Review and manage feedback
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ChatBubbleLeftIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Feedback</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <StarIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Average Rating</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.averageRating.toFixed(1)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ExclamationTriangleIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Actionable</p>
              <p className="text-2xl font-bold text-gray-900">{stats.actionable}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">High Priority</p>
              <p className="text-2xl font-bold text-gray-900">{stats.highPriority}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Filters</h2>
          <FunnelIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="content">Content</option>
              <option value="design">Design</option>
              <option value="technical">Technical</option>
              <option value="strategy">Strategy</option>
              <option value="general">General</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Actionable
            </label>
            <select
              value={filters.actionable}
              onChange={(e) => setFilters(prev => ({ ...prev, actionable: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="true">Actionable</option>
              <option value="false">Not Actionable</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating
            </label>
            <select
              value={filters.rating}
              onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
              <option value="0">No Rating</option>
            </select>
          </div>
        </div>
      </div>

      {/* Feedback List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Feedback ({filteredFeedbacks.length})
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredFeedbacks.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <ChatBubbleLeftIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No feedback found matching your filters.</p>
            </div>
          ) : (
            filteredFeedbacks.map((feedback) => (
              <div key={feedback.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        {feedback.createdBy.name || feedback.createdBy.email}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(feedback.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="flex items-center space-x-1">
                        {renderStars(feedback.rating)}
                        {feedback.rating > 0 && (
                          <span className="text-sm text-gray-600 ml-1">({feedback.rating}/5)</span>
                        )}
                      </div>
                      <Badge className={getCategoryColor(feedback.category)}>
                        {feedback.category}
                      </Badge>
                      <Badge className={getPriorityColor(feedback.priority)}>
                        {feedback.priority} priority
                      </Badge>
                      {feedback.actionable && (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircleIcon className="h-3 w-3 mr-1" />
                          Actionable
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-gray-700 mb-3">{feedback.comment}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Target: {feedback.targetTitle} ({feedback.targetType})
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {feedback.ideaId && (
                          <Link href={`/ideas/${feedback.ideaId}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center space-x-1"
                            >
                              <EyeIcon className="h-4 w-4" />
                              <span>View Idea</span>
                            </Button>
                          </Link>
                        )}
                        {feedback.contentDraftId && (
                          <Link href={`/ready-content/${feedback.contentDraftId}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center space-x-1"
                            >
                              <EyeIcon className="h-4 w-4" />
                              <span>View Draft</span>
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
} 