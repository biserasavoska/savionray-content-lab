'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { 
  EyeIcon, 
  DocumentTextIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  ChatBubbleLeftIcon,
  LightBulbIcon,
  CalendarIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  PlusIcon
} from '@heroicons/react/24/outline'

import { useOrganization } from '@/lib/contexts/OrganizationContext'
import { useInterface } from '@/hooks/useInterface'
import Button from '@/components/ui/common/Button'
import Badge from '@/components/ui/common/Badge'
import { formatDate } from '@/lib/utils/date-helpers'

interface ContentItem {
  id: string
  title: string
  status: string
  contentType: string
  createdAt: string
  createdBy: {
    id: string
    name: string
    email: string
    role: string
    image?: string
  }
  priority?: 'HIGH' | 'MEDIUM' | 'LOW'
  dueDate?: string
}

interface DashboardStats {
  pendingReview: number
  recentlyApproved: number
  totalContent: number
  feedbackProvided: number
  overdueItems: number
  thisWeekDeadlines: number
}

export default function ClientDashboard() {
  const { data: session } = useSession()
  const { currentOrganization, isLoading: orgLoading } = useOrganization()
  const interfaceContext = useInterface()
  const [pendingContent, setPendingContent] = useState<ContentItem[]>([])
  const [recentApproved, setRecentApproved] = useState<ContentItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    pendingReview: 0,
    recentlyApproved: 0,
    totalContent: 0,
    feedbackProvided: 0,
    overdueItems: 0,
    thisWeekDeadlines: 0
  })

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!session?.user || !currentOrganization) return

      try {
        // Fetch real data from API endpoints with organization context
        const [readyContentRes, approvedContentRes, statsRes] = await Promise.all([
          fetch('/api/ready-content?limit=5', {
            headers: {
              'x-selected-organization': currentOrganization.id
            }
          }),
          fetch('/api/approved?limit=5', {
            headers: {
              'x-selected-organization': currentOrganization.id
            }
          }),
          fetch('/api/client/stats', {
            headers: {
              'x-selected-organization': currentOrganization.id
            }
          })
        ])

        if (readyContentRes.ok) {
          const readyData = await readyContentRes.json()
          setPendingContent(readyData.content || [])
        }

        if (approvedContentRes.ok) {
          const approvedData = await approvedContentRes.json()
          setRecentApproved(approvedData.content || [])
        }

        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setStats(statsData)
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        // Fallback to mock data
        loadMockData()
      } finally {
        setIsLoading(false)
      }
    }

    const loadMockData = () => {
    const mockPendingContent: ContentItem[] = [
      {
        id: '1',
          title: 'Q4 Marketing Campaign - Social Media Series',
        status: 'PENDING_APPROVAL',
        contentType: 'SOCIAL_MEDIA_POST',
        createdAt: '2025-01-07T10:00:00Z',
          createdBy: {
            id: '1',
            name: 'Creative Team',
            email: 'creative@savionray.com',
            role: 'CREATIVE'
          },
          priority: 'HIGH',
          dueDate: '2025-01-10T17:00:00Z'
      },
      {
        id: '2',
          title: 'Product Launch Announcement Newsletter',
        status: 'PENDING_APPROVAL',
        contentType: 'NEWSLETTER',
        createdAt: '2025-01-07T09:30:00Z',
          createdBy: {
            id: '1',
            name: 'Creative Team',
            email: 'creative@savionray.com',
            role: 'CREATIVE'
          },
          priority: 'MEDIUM',
          dueDate: '2025-01-12T17:00:00Z'
        },
        {
          id: '3',
          title: 'Website Homepage Copy Update',
          status: 'PENDING_APPROVAL',
          contentType: 'WEBSITE_COPY',
          createdAt: '2025-01-06T14:00:00Z',
          createdBy: {
            id: '1',
            name: 'Creative Team',
            email: 'creative@savionray.com',
            role: 'CREATIVE'
          },
          priority: 'LOW',
          dueDate: '2025-01-15T17:00:00Z'
      }
    ]

    const mockRecentApproved: ContentItem[] = [
      {
          id: '4',
          title: 'Holiday Promotion Campaign',
        status: 'APPROVED',
        contentType: 'SOCIAL_MEDIA_POST',
        createdAt: '2025-01-06T15:00:00Z',
          createdBy: {
            id: '1',
            name: 'Creative Team',
            email: 'creative@savionray.com',
            role: 'CREATIVE'
          }
        },
        {
          id: '5',
          title: 'Customer Success Story Blog Post',
          status: 'APPROVED',
          contentType: 'BLOG_POST',
          createdAt: '2025-01-05T11:00:00Z',
          createdBy: {
            id: '1',
            name: 'Creative Team',
            email: 'creative@savionray.com',
            role: 'CREATIVE'
          }
        }
      ]

      setPendingContent(mockPendingContent)
      setRecentApproved(mockRecentApproved)
      setStats({
        pendingReview: mockPendingContent.length,
        recentlyApproved: mockRecentApproved.length,
        totalContent: mockPendingContent.length + mockRecentApproved.length,
        feedbackProvided: 3,
        overdueItems: 1,
        thisWeekDeadlines: 2
      })
    }

    fetchDashboardData()
  }, [session?.user, currentOrganization])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return (
          <Badge variant="secondary" size="sm">
            <ClockIcon className="w-3 h-3 mr-1" />
            Pending Review
          </Badge>
        )
      case 'APPROVED':
        return (
          <Badge variant="default" size="sm">
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        )
      default:
        return (
          <Badge variant="default" size="sm">
            {status}
          </Badge>
        )
    }
  }

  const getPriorityBadge = (priority?: string) => {
    switch (priority) {
      case 'HIGH':
        return <Badge variant="destructive" size="sm">High Priority</Badge>
      case 'MEDIUM':
        return <Badge variant="secondary" size="sm">Medium Priority</Badge>
      case 'LOW':
        return <Badge variant="default" size="sm">Low Priority</Badge>
      default:
        return null
    }
  }

  const getContentTypeIcon = (contentType: string) => {
    switch (contentType) {
      case 'SOCIAL_MEDIA_POST':
        return <ChatBubbleLeftIcon className="h-4 w-4" />
      case 'BLOG_POST':
        return <DocumentTextIcon className="h-4 w-4" />
      case 'NEWSLETTER':
        return <DocumentTextIcon className="h-4 w-4" />
      case 'WEBSITE_COPY':
        return <DocumentTextIcon className="h-4 w-4" />
      case 'EMAIL_CAMPAIGN':
        return <DocumentTextIcon className="h-4 w-4" />
      default:
        return <DocumentTextIcon className="h-4 w-4" />
    }
  }

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Enhanced Header */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {currentOrganization ? `${currentOrganization.name} Content Lab` : 'Content Creation Dashboard'}
            </h1>
            <p className="text-gray-600 mt-2">
          {currentOrganization 
            ? `Review and approve content for ${currentOrganization.name}`
            : 'Review and approve content from your creative team'
          }
        </p>
        {currentOrganization && (
              <div className="mt-3 flex items-center space-x-3">
                <Badge variant="default">
                  <LightBulbIcon className="w-3 h-3 mr-1" />
              Organization: {currentOrganization.name}
                </Badge>
                <Badge variant="default">
                  <CheckCircleIcon className="w-3 h-3 mr-1" />
                  Client Access
                </Badge>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Review</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingReview}</p>
              {stats.overdueItems > 0 && (
                <p className="text-xs text-red-600 mt-1">
                  {stats.overdueItems} overdue
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Recently Approved</p>
              <p className="text-2xl font-bold text-gray-900">{stats.recentlyApproved}</p>
              <p className="text-xs text-green-600 mt-1">This week</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Content</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalContent}</p>
              <p className="text-xs text-blue-600 mt-1">All time</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <ChatBubbleLeftIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Feedback Provided</p>
              <p className="text-2xl font-bold text-gray-900">{stats.feedbackProvided}</p>
              <p className="text-xs text-purple-600 mt-1">This month</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Overdue Items</p>
              <p className="text-2xl font-bold text-gray-900">{stats.overdueItems}</p>
              <p className="text-xs text-red-600 mt-1">Needs attention</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">This Week</p>
              <p className="text-2xl font-bold text-gray-900">{stats.thisWeekDeadlines}</p>
              <p className="text-xs text-indigo-600 mt-1">Deadlines</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/ideas">
              <Button variant="default" className="w-full justify-center">
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              Approve Ideas
              </Button>
            </Link>
            <Link href="/ready-content">
              <Button variant="default" className="w-full justify-center">
              <EyeIcon className="h-5 w-5 mr-2" />
              Review Content
              </Button>
            </Link>
            <Link href="/feedback-management">
              <Button variant="secondary" className="w-full justify-center">
              <ChatBubbleLeftIcon className="h-5 w-5 mr-2" />
              Provide Feedback
              </Button>
            </Link>
            <Link href="/approved">
              <Button variant="outline" className="w-full justify-center">
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                View Approved
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Enhanced Pending Content Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <EyeIcon className="h-5 w-5 mr-2 text-blue-600" />
            Content Pending Review
              {stats.pendingReview > 0 && (
                <Badge variant="secondary" size="sm" className="ml-2">
                  {stats.pendingReview}
                </Badge>
              )}
          </h2>
            <Link href="/ready-content">
              <Button variant="secondary" size="sm">
                View All
                <ArrowRightIcon className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {pendingContent.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No content pending review</h3>
              <p className="text-gray-500 mb-4">All content has been reviewed and approved.</p>
              <Button variant="default">
                <PlusIcon className="h-4 w-4 mr-2" />
                Request New Content
              </Button>
            </div>
          ) : (
            pendingContent?.map((item) => (
              <div key={item.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-sm font-semibold text-gray-900">{item.title || 'Untitled'}</h3>
                      {getPriorityBadge(item.priority)}
                                             {isOverdue(item.dueDate) && (
                         <Badge variant="destructive" size="sm">Overdue</Badge>
                       )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                      <span className="flex items-center">
                        {getContentTypeIcon(item.contentType)}
                        <span className="ml-1">{item.contentType?.replace(/_/g, ' ') || 'Unknown'}</span>
                      </span>
                      <span>Created by {item.createdBy?.name || item.createdBy?.email || 'Unknown'}</span>
                      <span>{item.createdAt ? formatDate(item.createdAt) : 'Unknown date'}</span>
                      {item.dueDate && (
                        <span className={`flex items-center ${isOverdue(item.dueDate) ? 'text-red-600' : 'text-gray-500'}`}>
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          Due: {formatDate(item.dueDate)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(item.status)}
                    <Link href={`/ready-content/${item.id}`}>
                      <Button variant="default" size="sm">
                      Review
                        <ArrowRightIcon className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>



      {/* Enhanced Recent Approved */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <CheckCircleIcon className="h-5 w-5 mr-2 text-green-600" />
            Recently Approved
          </h2>
            <Link href="/approved">
              <Button variant="secondary" size="sm">
                View All
                <ArrowRightIcon className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {recentApproved.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <CheckCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No recently approved content</h3>
              <p className="text-gray-500">Approved content will appear here.</p>
            </div>
          ) : (
            recentApproved?.map((item) => (
              <div key={item.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-900">{item.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                      <span className="flex items-center">
                        {getContentTypeIcon(item.contentType)}
                        <span className="ml-1">{item.contentType?.replace(/_/g, ' ') || 'Unknown'}</span>
                      </span>
                      <span>Created by {item.createdBy?.name || item.createdBy?.email || 'Unknown'}</span>
                      <span>Approved {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Unknown date'}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(item.status)}
                    <Link href={`/approved/${item.id}`}>
                      <Button variant="outline" size="sm">
                      View
                        <ArrowRightIcon className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
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