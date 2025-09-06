'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useOrganization } from '@/lib/contexts/OrganizationContext'
import { 
  LightBulbIcon, 
  DocumentTextIcon, 
  UsersIcon, 
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface DashboardStats {
  totalIdeas: number
  pendingDrafts: number
  approvedContent: number
  activeClients: number
  contentThisMonth: number
  pendingApprovals: number
}

interface RecentActivity {
  id: string
  type: string
  title: string
  status: string
  client: string
  createdAt: string
}

export default function AgencyDashboard() {
  const { data: session } = useSession()
  const { currentOrganization } = useOrganization()
  const [stats, setStats] = useState<DashboardStats>({
    totalIdeas: 0,
    pendingDrafts: 0,
    approvedContent: 0,
    activeClients: 0,
    contentThisMonth: 0,
    pendingApprovals: 0
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!session?.user || !currentOrganization) return

      try {
        setIsLoading(true)
        setError(null)

        // Fetch real data from API endpoints with organization context
        const [statsRes, activityRes] = await Promise.all([
          fetch('/api/agency/stats', {
            headers: {
              'x-selected-organization': currentOrganization.id
            }
          }),
          fetch('/api/agency/activity', {
            headers: {
              'x-selected-organization': currentOrganization.id
            }
          })
        ])

        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setStats(statsData)
        } else {
          throw new Error('Failed to fetch stats')
        }

        if (activityRes.ok) {
          const activityData = await activityRes.json()
          setRecentActivity(activityData.activity || [])
        } else {
          throw new Error('Failed to fetch activity')
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
        
        // Fallback to mock data
        const mockStats: DashboardStats = {
          totalIdeas: 0,
          pendingDrafts: 0,
          approvedContent: 0,
          activeClients: 0,
          contentThisMonth: 0,
          pendingApprovals: 0
        }
        setStats(mockStats)
        setRecentActivity([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [session?.user, currentOrganization])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            Approved
          </span>
        )
      case 'PENDING_APPROVAL':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="w-3 h-3 mr-1" />
            Pending
          </span>
        )
      case 'PUBLISHED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <DocumentTextIcon className="w-3 h-3 mr-1" />
            Published
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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'idea':
        return <LightBulbIcon className="h-5 w-5 text-blue-600" />
      case 'draft':
        return <DocumentTextIcon className="h-5 w-5 text-yellow-600" />
      case 'content':
        return <DocumentTextIcon className="h-5 w-5 text-green-600" />
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-600" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error loading dashboard</h3>
          <p className="text-red-600">{error}</p>
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Agency Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your content creation and client management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Ideas */}
        <Link href="/ideas" className="block">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-all duration-200 hover:border-blue-300 cursor-pointer border border-transparent">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <LightBulbIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Ideas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalIdeas}</p>
              </div>
            </div>
          </div>
        </Link>

        {/* Pending Drafts */}
        <Link href="/ready-content" className="block">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-all duration-200 hover:border-yellow-300 cursor-pointer border border-transparent">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DocumentTextIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Drafts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingDrafts}</p>
              </div>
            </div>
          </div>
        </Link>

        {/* Approved */}
        <Link href="/approved" className="block">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-all duration-200 hover:border-green-300 cursor-pointer border border-transparent">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approvedContent}</p>
              </div>
            </div>
          </div>
        </Link>

        {/* Active Clients */}
        <Link href="/admin/organizations" className="block">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-all duration-200 hover:border-purple-300 cursor-pointer border border-transparent">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <UsersIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Clients</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeClients}</p>
              </div>
            </div>
          </div>
        </Link>

        {/* Content This Month */}
        <Link href="/ready-content" className="block">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-all duration-200 hover:border-indigo-300 cursor-pointer border border-transparent">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Content This Month</p>
                <p className="text-2xl font-bold text-gray-900">{stats.contentThisMonth}</p>
              </div>
            </div>
          </div>
        </Link>

        {/* Pending Approvals */}
        <Link href="/ready-content" className="block">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-all duration-200 hover:border-orange-300 cursor-pointer border border-transparent">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <ExclamationTriangleIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Approvals</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingApprovals}</p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => window.location.href = '/ideas/new'}
            className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <LightBulbIcon className="h-5 w-5 mr-2" />
            Create New Idea
          </button>
          <button 
            onClick={() => window.location.href = '/ready-content'}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <DocumentTextIcon className="h-5 w-5 mr-2" />
            Review Content
          </button>
          <button 
            onClick={() => window.location.href = '/admin/organizations'}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <UsersIcon className="h-5 w-5 mr-2" />
            Manage Clients
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {recentActivity.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No recent activity</p>
            </div>
          ) : (
            recentActivity.map((activity) => (
              <div key={activity.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getActivityIcon(activity.type)}
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{activity.title}</h3>
                      <p className="text-sm text-gray-500">
                        {activity.client} • {new Date(activity.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(activity.status)}
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
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