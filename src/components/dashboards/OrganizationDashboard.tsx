'use client'

import React, { useState, useEffect } from 'react'
import { useOrganization } from '@/lib/contexts/OrganizationContext'
import Card from '@/components/ui/layout/Card'
import Button from '@/components/ui/common/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Badge from '@/components/ui/common/Badge'

interface OrganizationStats {
  totalIdeas: number
  totalContentDrafts: number
  totalPublishedContent: number
  totalDeliveryPlans: number
  activeUsers: number
  recentActivity: Array<{
    id: string
    type: 'idea' | 'draft' | 'published' | 'plan'
    title: string
    createdAt: string
    createdBy: string
  }>
}

interface OrganizationDashboardProps {
  organizationId?: string
}

export default function OrganizationDashboard({ organizationId }: OrganizationDashboardProps) {
  const { currentOrganization } = useOrganization()
  const [stats, setStats] = useState<OrganizationStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const orgId = organizationId || currentOrganization?.id

  useEffect(() => {
    if (!orgId) return

    const fetchOrganizationStats = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/organization/${orgId}/stats`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch organization statistics')
        }

        const data = await response.json()
        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrganizationStats()
  }, [orgId])

  if (!orgId) {
    return (
      <div className="p-6">
        <Card>
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold text-gray-600 mb-2">
              No Organization Selected
            </h2>
            <p className="text-gray-500">
              Please select an organization to view its dashboard.
            </p>
          </div>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <Card>
          <div className="text-center py-8">
            <LoadingSpinner />
            <p className="mt-2 text-gray-500">Loading organization dashboard...</p>
          </div>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold text-red-600 mb-2">
              Error Loading Dashboard
            </h2>
            <p className="text-gray-500 mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Retry
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="p-6">
        <Card>
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold text-gray-600 mb-2">
              No Data Available
            </h2>
            <p className="text-gray-500">
              No statistics available for this organization.
            </p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Organization Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {currentOrganization?.name} Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Organization overview and analytics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">
            {currentOrganization?.subscriptionPlan || 'Standard'}
          </Badge>
          <Badge variant={currentOrganization?.subscriptionStatus === 'active' ? 'default' : 'secondary'}>
            {currentOrganization?.subscriptionStatus || 'Unknown'}
          </Badge>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Ideas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalIdeas}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Content Drafts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalContentDrafts}</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Published Content</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPublishedContent}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
          
          {stats.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      activity.type === 'idea' ? 'bg-blue-100' :
                      activity.type === 'draft' ? 'bg-yellow-100' :
                      activity.type === 'published' ? 'bg-green-100' :
                      'bg-purple-100'
                    }`}>
                      <svg className={`w-4 h-4 ${
                        activity.type === 'idea' ? 'text-blue-600' :
                        activity.type === 'draft' ? 'text-yellow-600' :
                        activity.type === 'published' ? 'text-green-600' :
                        'text-purple-600'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {activity.type === 'idea' && (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        )}
                        {activity.type === 'draft' && (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        )}
                        {activity.type === 'published' && (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        )}
                        {activity.type === 'plan' && (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        )}
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-500">
                        Created by {activity.createdBy} • {new Date(activity.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                                     <Badge variant="secondary" className="capitalize">
                     {activity.type}
                   </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No recent activity</p>
            </div>
          )}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={() => window.location.href = '/ideas/new'}
              className="w-full"
            >
              Create New Idea
            </Button>
            <Button 
              onClick={() => window.location.href = '/create-content'}
              variant="outline"
              className="w-full"
            >
              Generate Content
            </Button>
            <Button 
              onClick={() => window.location.href = '/delivery-plans/new'}
              variant="outline"
              className="w-full"
            >
              Create Delivery Plan
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
} 