'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useCurrentOrganization } from '@/hooks/useCurrentOrganization'
import { EyeIcon, DocumentTextIcon, CheckCircleIcon, ClockIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline'

interface ContentItem {
  id: string
  title: string
  status: string
  contentType: string
  createdAt: string
  createdBy: string
}

export default function ClientDashboard() {
  const { data: session } = useSession()
  const { organization, isLoading: orgLoading } = useCurrentOrganization()
  const [pendingContent, setPendingContent] = useState<ContentItem[]>([])
  const [recentApproved, setRecentApproved] = useState<ContentItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // In a real implementation, this would fetch data from API
    // For now, we'll use mock data
    const mockPendingContent: ContentItem[] = [
      {
        id: '1',
        title: 'Q4 Marketing Campaign',
        status: 'PENDING_APPROVAL',
        contentType: 'SOCIAL_MEDIA_POST',
        createdAt: '2025-01-07T10:00:00Z',
        createdBy: 'Creative Team'
      },
      {
        id: '2',
        title: 'Product Launch Announcement',
        status: 'PENDING_APPROVAL',
        contentType: 'NEWSLETTER',
        createdAt: '2025-01-07T09:30:00Z',
        createdBy: 'Creative Team'
      }
    ]

    const mockRecentApproved: ContentItem[] = [
      {
        id: '3',
        title: 'Holiday Promotion',
        status: 'APPROVED',
        contentType: 'SOCIAL_MEDIA_POST',
        createdAt: '2025-01-06T15:00:00Z',
        createdBy: 'Creative Team'
      }
    ]

    setTimeout(() => {
      setPendingContent(mockPendingContent)
      setRecentApproved(mockRecentApproved)
      setIsLoading(false)
    }, 1000)
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="w-3 h-3 mr-1" />
            Pending
          </span>
        )
      case 'APPROVED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            Approved
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        )
    }
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
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          {organization ? `${organization.name} Dashboard` : 'Content Review Dashboard'}
        </h1>
        <p className="text-gray-600 mt-1">
          {organization 
            ? `Review and approve content for ${organization.name}`
            : 'Review and approve content from your creative team'
          }
        </p>
        {organization && (
          <div className="mt-2 flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Organization: {organization.name}
            </span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Review</p>
              <p className="text-2xl font-bold text-gray-900">{pendingContent.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Recently Approved</p>
              <p className="text-2xl font-bold text-gray-900">{recentApproved.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Content</p>
              <p className="text-2xl font-bold text-gray-900">{pendingContent.length + recentApproved.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ChatBubbleLeftIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Feedback Provided</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Content */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <EyeIcon className="h-5 w-5 mr-2 text-blue-600" />
            Content Pending Review
          </h2>
        </div>
        <div className="divide-y divide-gray-200">
          {pendingContent.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No content pending review</p>
            </div>
          ) : (
            pendingContent.map((item) => (
              <div key={item.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {item.contentType} • Created by {item.createdBy}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(item.status)}
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      Review
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors">
              <EyeIcon className="h-5 w-5 mr-2" />
              Review Content
            </button>
            <button className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors">
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              Approve Ideas
            </button>
            <button className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 transition-colors">
              <ChatBubbleLeftIcon className="h-5 w-5 mr-2" />
              Provide Feedback
            </button>
          </div>
        </div>
      </div>

      {/* Recent Approved Content */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <CheckCircleIcon className="h-5 w-5 mr-2 text-green-600" />
            Recently Approved
          </h2>
        </div>
        <div className="divide-y divide-gray-200">
          {recentApproved.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <CheckCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No recently approved content</p>
            </div>
          ) : (
            recentApproved.map((item) => (
              <div key={item.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {item.contentType} • Created by {item.createdBy}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(item.status)}
                    <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                      View
                    </button>
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