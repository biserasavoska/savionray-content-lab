'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Button,
  StatusBadge,
  PageLayout,
  PageHeader,
  PageContent,
  PageSection,
  Input,
  ErrorDisplay
} from '@/components/ui/common'

interface User {
  id: string
  name: string | null
  email: string | null
  role: string
  image: string | null
}

interface OrganizationUser {
  id: string
  userId: string
  role: string
  isActive: boolean
  User_OrganizationUser_userIdToUser: User
}

interface Organization {
  id: string
  name: string
  slug: string
  domain: string | null
  primaryColor: string | null
  subscriptionPlan: string | null
  subscriptionStatus: string | null
  maxUsers: number | null
  OrganizationUser: OrganizationUser[]
}

interface OrganizationWithUsers extends Organization {
  OrganizationUser: (OrganizationUser & {
    User_OrganizationUser_userIdToUser: User
  })[]
}

interface OrganizationSettingsFormProps {
  organizationId: string
  organizationName: string
}

export default function OrganizationSettingsForm({ organizationId, organizationName }: OrganizationSettingsFormProps) {
  const [organization, setOrganization] = useState<OrganizationWithUsers | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  // Fetch organization data
  useEffect(() => {
    const fetchOrganizationData = async () => {
      try {
        setIsLoadingData(true)
        const response = await fetch(`/api/organization/${organizationId}`, {
          headers: {
            'x-selected-organization': organizationId,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setOrganization(data.organization)
        } else {
          console.error('Failed to fetch organization data')
        }
      } catch (error) {
        console.error('Error fetching organization data:', error)
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchOrganizationData()
  }, [organizationId])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      slug: formData.get('slug') as string,
      domain: formData.get('domain') as string,
      primaryColor: formData.get('primaryColor') as string,
    }

    try {
      const response = await fetch(`/api/organization/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-selected-organization': organizationId,
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setMessage('Organization settings updated successfully!')
        setMessageType('success')
      } else {
        const error = await response.json()
        setMessage(`Error: ${error.message}`)
        setMessageType('error')
      }
    } catch (error) {
      setMessage('An error occurred while updating settings')
      setMessageType('error')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingData) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-3 text-gray-600">Loading organization data...</p>
      </div>
    )
  }

  if (!organization) {
    return (
      <div className="text-center py-8 text-gray-600">
        No organization data available.
      </div>
    )
  }

  return (
    <PageLayout>
      <PageHeader 
        title="Organization Settings"
        subtitle="Manage your organization's basic information, subscription, and team members"
      />
      <PageContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <PageSection title="Basic Information">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Input
                label="Organization Name"
                type="text"
                name="name"
                defaultValue={organization.name}
                required
              />
              <Input
                label="Organization Slug"
                type="text"
                name="slug"
                defaultValue={organization.slug}
                required
              />
              <Input
                label="Custom Domain (Optional)"
                type="text"
                name="domain"
                defaultValue={organization.domain || ''}
                placeholder="example.com"
              />
              <Input
                label="Primary Color"
                type="color"
                name="primaryColor"
                defaultValue={organization.primaryColor || '#3B82F6'}
                className="h-10"
              />
            </div>
          </PageSection>

          <PageSection title="Subscription">
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Plan</p>
                  <p className="text-sm text-gray-900 capitalize">{organization.subscriptionPlan?.toLowerCase() || 'Free'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Status</p>
                  <p className="text-sm text-gray-900 capitalize">{organization.subscriptionStatus?.toLowerCase() || 'Active'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Max Users</p>
                  <p className="text-sm text-gray-900">{organization.maxUsers || 'Unlimited'}</p>
                </div>
              </div>
            </div>
          </PageSection>

          <PageSection title="Team Management">
            <div className="bg-white border border-gray-200 rounded-md">
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Active Members ({organization.OrganizationUser.length})</span>
                    <p className="text-xs text-gray-500 mt-1">Manage roles, permissions, and team members</p>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      href="/organization/users"
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                    >
                      Manage Team
                    </Link>
                    <Button variant="ghost" size="sm">
                      Invite Member
                    </Button>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {organization.OrganizationUser.map((orgUser) => (
                  <div key={orgUser.id} className="px-4 py-3 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{orgUser.User_OrganizationUser_userIdToUser.name}</p>
                      <p className="text-sm text-gray-500">{orgUser.User_OrganizationUser_userIdToUser.email}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <StatusBadge 
                        status={orgUser.role.toLowerCase() as any}
                        size="sm"
                      />
                      <StatusBadge 
                        status={orgUser.User_OrganizationUser_userIdToUser.role.toLowerCase() as any}
                        size="sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </PageSection>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isLoading}
              loading={isLoading}
              variant="default"
              size="default"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>

          {/* Message */}
          {message && (
            <div className="mt-4">
              {messageType === 'error' ? (
                <ErrorDisplay
                  title="Update Failed"
                  message={message}
                  variant="destructive"
                />
              ) : (
                <div className="p-4 bg-green-50 border border-green-200 rounded-md text-green-700">
                  {message}
                </div>
              )}
            </div>
          )}
        </form>
      </PageContent>
    </PageLayout>
  )
} 