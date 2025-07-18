'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import EnhancedContentReviewWorkflow from '@/components/content/EnhancedContentReviewWorkflow'
import ContentSchedulingCalendar from '@/components/content/ContentSchedulingCalendar'
import ContentAnalyticsDashboard from '@/components/content/ContentAnalyticsDashboard'

// Mock data for testing
const mockContentDrafts = [
  {
    id: '1',
    status: 'DRAFT',
    body: 'This is a sample content draft for testing the enhanced workflow features. It includes various statuses and feedback to demonstrate the functionality.',
    metadata: { contentType: 'SOCIAL_MEDIA_POST' },
    createdAt: '2025-07-15T10:00:00Z',
    updatedAt: '2025-07-15T14:30:00Z',
    createdBy: {
      id: 'user1',
      name: 'John Creative',
      email: 'john@example.com'
    },
    idea: {
      id: 'idea1',
      title: 'Summer Marketing Campaign',
      description: 'Engaging summer content for social media',
      status: 'APPROVED'
    },
    feedbacks: [
      {
        id: 'feedback1',
        comment: 'Great concept! Consider adding more visual elements.',
        createdAt: '2025-07-15T11:00:00Z',
        createdBy: {
          id: 'user2',
          name: 'Sarah Client',
          email: 'sarah@example.com'
        }
      }
    ]
  },
  {
    id: '2',
    status: 'AWAITING_FEEDBACK',
    body: 'Another content piece that demonstrates the workflow status tracking and collaboration features.',
    metadata: { contentType: 'BLOG_POST' },
    createdAt: '2025-07-14T09:00:00Z',
    updatedAt: '2025-07-15T16:00:00Z',
    createdBy: {
      id: 'user1',
      name: 'John Creative',
      email: 'john@example.com'
    },
    idea: {
      id: 'idea2',
      title: 'Product Launch Announcement',
      description: 'Exciting new product launch content',
      status: 'APPROVED'
    },
    feedbacks: []
  },
  {
    id: '3',
    status: 'APPROVED',
    body: 'This content has been approved and is ready for publishing. It showcases the complete workflow process.',
    metadata: { contentType: 'NEWSLETTER' },
    createdAt: '2025-07-13T08:00:00Z',
    updatedAt: '2025-07-15T12:00:00Z',
    createdBy: {
      id: 'user3',
      name: 'Mike Designer',
      email: 'mike@example.com'
    },
    idea: {
      id: 'idea3',
      title: 'Monthly Newsletter',
      description: 'Monthly company newsletter content',
      status: 'APPROVED'
    },
    feedbacks: [
      {
        id: 'feedback2',
        comment: 'Perfect! Ready to publish.',
        createdAt: '2025-07-15T10:30:00Z',
        createdBy: {
          id: 'user2',
          name: 'Sarah Client',
          email: 'sarah@example.com'
        }
      }
    ]
  }
]

const mockScheduledContent = [
  {
    id: 'schedule1',
    title: 'Summer Marketing Campaign',
    description: 'Engaging summer content for social media',
    scheduledDate: '2025-07-20T10:00:00Z',
    status: 'SCHEDULED' as const,
    contentType: 'SOCIAL_MEDIA_POST',
    platform: 'Instagram',
    createdBy: {
      id: 'user1',
      name: 'John Creative',
      email: 'john@example.com'
    },
    contentDraft: {
      id: 'draft1',
      body: 'This is a sample content draft for testing the enhanced workflow features.',
      status: 'APPROVED'
    }
  },
  {
    id: 'schedule2',
    title: 'Product Launch Announcement',
    description: 'Exciting new product launch content',
    scheduledDate: '2025-07-22T14:00:00Z',
    status: 'SCHEDULED' as const,
    contentType: 'BLOG_POST',
    platform: 'LinkedIn',
    createdBy: {
      id: 'user1',
      name: 'John Creative',
      email: 'john@example.com'
    },
    contentDraft: {
      id: 'draft2',
      body: 'Another content piece that demonstrates the workflow status tracking.',
      status: 'APPROVED'
    }
  },
  {
    id: 'schedule3',
    title: 'Monthly Newsletter',
    description: 'Monthly company newsletter content',
    scheduledDate: '2025-07-25T09:00:00Z',
    status: 'PUBLISHED' as const,
    contentType: 'NEWSLETTER',
    platform: 'Email',
    createdBy: {
      id: 'user3',
      name: 'Mike Designer',
      email: 'mike@example.com'
    },
    contentDraft: {
      id: 'draft3',
      body: 'This content has been approved and is ready for publishing.',
      status: 'PUBLISHED'
    }
  }
]

const mockAnalyticsMetrics = {
  totalContent: 156,
  publishedContent: 142,
  engagementRate: 8.5,
  averageViews: 2450,
  totalLikes: 12450,
  totalComments: 890,
  totalShares: 567,
  conversionRate: 3.2,
  topPerformingContent: [
    {
      id: 'content1',
      title: 'Summer Marketing Campaign',
      views: 12500,
      likes: 890,
      comments: 67,
      shares: 45,
      publishedDate: '2025-07-10T10:00:00Z'
    },
    {
      id: 'content2',
      title: 'Product Launch Announcement',
      views: 8900,
      likes: 567,
      comments: 34,
      shares: 23,
      publishedDate: '2025-07-08T14:00:00Z'
    },
    {
      id: 'content3',
      title: 'Monthly Newsletter',
      views: 6700,
      likes: 445,
      comments: 28,
      shares: 19,
      publishedDate: '2025-07-05T09:00:00Z'
    }
  ],
  contentByType: [
    { type: 'Social Media Posts', count: 89, percentage: 57.1 },
    { type: 'Blog Posts', count: 34, percentage: 21.8 },
    { type: 'Newsletters', count: 22, percentage: 14.1 },
    { type: 'Email Campaigns', count: 11, percentage: 7.0 }
  ],
  engagementTrend: [
    { date: '2025-07-10', views: 1200, likes: 89, comments: 12 },
    { date: '2025-07-11', views: 1350, likes: 102, comments: 15 },
    { date: '2025-07-12', views: 1100, likes: 78, comments: 9 }
  ],
  platformPerformance: [
    { platform: 'Instagram', posts: 45, engagement: 12.5, reach: 45000 },
    { platform: 'LinkedIn', posts: 23, engagement: 8.2, reach: 28000 },
    { platform: 'Email', posts: 12, engagement: 15.8, reach: 12000 }
  ]
}

export default function TestPhase3Page() {
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState<'workflow' | 'scheduling' | 'analytics'>('workflow')
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Phase 3 features...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Phase 3 Test Page</h1>
          <p className="text-gray-600 mb-4">Please sign in to test the enhanced workflow features</p>
          <a
            href="/auth/signin"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Sign In
          </a>
        </div>
      </div>
    )
  }

  const handleStatusChange = (draftId: string, newStatus: string) => {
    console.log(`Status changed for draft ${draftId} to ${newStatus}`)
    // In a real app, this would make an API call
  }

  const handleAddFeedback = (draftId: string, comment: string) => {
    console.log(`Added feedback to draft ${draftId}: ${comment}`)
    // In a real app, this would make an API call
  }

  const handleEditDraft = (draftId: string) => {
    console.log(`Edit draft ${draftId}`)
    // In a real app, this would navigate to edit page
  }

  const handleScheduleContent = (contentId: string, scheduledDate: string) => {
    console.log(`Scheduled content ${contentId} for ${scheduledDate}`)
    // In a real app, this would make an API call
  }

  const handleEditSchedule = (scheduleId: string) => {
    console.log(`Edit schedule ${scheduleId}`)
    // In a real app, this would open edit modal
  }

  const handleDeleteSchedule = (scheduleId: string) => {
    console.log(`Delete schedule ${scheduleId}`)
    // In a real app, this would make an API call
  }

  const handleAddSchedule = () => {
    console.log('Add new schedule')
    // In a real app, this would open add modal
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Phase 3: Workflow Enhancements</h1>
          <p className="text-gray-600">
            Testing enhanced content review workflow, scheduling calendar, and analytics dashboard
          </p>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This is a test page with mock data. All interactions are logged to the console.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'workflow', label: 'Enhanced Workflow', icon: '🔄' },
              { id: 'scheduling', label: 'Scheduling Calendar', icon: '📅' },
              { id: 'analytics', label: 'Analytics Dashboard', icon: '📊' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {activeTab === 'workflow' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Enhanced Content Review Workflow</h2>
              <EnhancedContentReviewWorkflow
                contentDrafts={mockContentDrafts}
                onStatusChange={handleStatusChange}
                onAddFeedback={handleAddFeedback}
                onEditDraft={handleEditDraft}
              />
            </div>
          )}

          {activeTab === 'scheduling' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Content Scheduling Calendar</h2>
              <ContentSchedulingCalendar
                scheduledContent={mockScheduledContent}
                onScheduleContent={handleScheduleContent}
                onEditSchedule={handleEditSchedule}
                onDeleteSchedule={handleDeleteSchedule}
                onAddSchedule={handleAddSchedule}
              />
            </div>
          )}

          {activeTab === 'analytics' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Content Analytics Dashboard</h2>
              <ContentAnalyticsDashboard
                metrics={mockAnalyticsMetrics}
                timeRange={timeRange}
                onTimeRangeChange={setTimeRange}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 p-6 bg-white rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Phase 3 Features Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Enhanced Workflow</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Status tracking with visual indicators</li>
                <li>• Real-time feedback integration</li>
                <li>• Advanced filtering and sorting</li>
                <li>• Collaborative review process</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Scheduling Calendar</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Visual calendar interface</li>
                <li>• Drag-and-drop scheduling</li>
                <li>• Multi-platform support</li>
                <li>• Date-specific content management</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Analytics Dashboard</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Performance metrics tracking</li>
                <li>• Engagement rate analysis</li>
                <li>• Top performing content</li>
                <li>• Platform-specific insights</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 