'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Organization {
  id: string
  name: string
  slug: string
  domain: string | null
  primaryColor: string | null
  subscriptionPlan: string
  subscriptionStatus: string
  maxUsers: number
  createdAt: string
  updatedAt: string
  userCount: number
  stats: {
    ideas: number
    contentDrafts: number
    deliveryPlans: number
    contentItems: number
  }
  users: Array<{
    id: string
    name: string | null
    email: string | null
    systemRole: string
    organizationRole: string
  }>
}

interface OrganizationManagementListProps {}

export default function OrganizationManagementList({}: OrganizationManagementListProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    fetchOrganizations()
  }, [])

  const fetchOrganizations = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter) params.append('status', statusFilter)

      const response = await fetch(`/api/admin/organizations?${params}`)
      if (response.ok) {
        const data = await response.json()
        setOrganizations(data.organizations)
      } else {
        setError('Failed to fetch organizations')
      }
    } catch (error) {
      setError('An error occurred while fetching organizations')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    fetchOrganizations()
  }

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    fetchOrganizations()
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Search and Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search organizations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="TRIAL">Trial</option>
            <option value="PAST_DUE">Past Due</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Search
          </button>
        </div>
      </div>

      {/* Organizations List */}
      <div className="space-y-4">
        {organizations.map((org) => (
          <div key={org.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: org.primaryColor || '#3B82F6' }}
                  ></div>
                  <h3 className="text-lg font-semibold text-gray-900">{org.name}</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    @{org.slug}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Subscription</p>
                    <p className="text-sm text-gray-900 capitalize">{org.subscriptionPlan.toLowerCase()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Status</p>
                    <p className="text-sm text-gray-900 capitalize">{org.subscriptionStatus.toLowerCase()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Users</p>
                    <p className="text-sm text-gray-900">{org.userCount} / {org.maxUsers}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Created</p>
                    <p className="text-sm text-gray-900">{new Date(org.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Ideas</p>
                    <p className="text-sm text-gray-900">{org.stats.ideas}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Drafts</p>
                    <p className="text-sm text-gray-900">{org.stats.contentDrafts}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Delivery Plans</p>
                    <p className="text-sm text-gray-900">{org.stats.deliveryPlans}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Content Items</p>
                    <p className="text-sm text-gray-900">{org.stats.contentItems}</p>
                  </div>
                </div>

                {/* Users Preview */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Team Members</p>
                  <div className="flex flex-wrap gap-2">
                    {org.users.slice(0, 5).map((user) => (
                      <div key={user.id} className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs">
                        <span className="font-medium">{user.name || user.email}</span>
                        <span className="text-gray-500">({user.organizationRole})</span>
                      </div>
                    ))}
                    {org.users.length > 5 && (
                      <span className="text-xs text-gray-500">+{org.users.length - 5} more</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 ml-4">
                <Link
                  href={`/admin/organizations/${org.id}`}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 text-center"
                >
                  View Details
                </Link>
                <Link
                  href={`/admin/organizations/${org.id}/users`}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 text-center"
                >
                  Manage Users
                </Link>
                <Link
                  href={`/admin/organizations/${org.id}/edit`}
                  className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 text-center"
                >
                  Edit
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {organizations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No organizations found</p>
        </div>
      )}
    </div>
  )
} 