'use client'

import { useState } from 'react'
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
  organization: OrganizationWithUsers
}

export default function OrganizationSettingsForm({ organization }: OrganizationSettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

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

          <PageSection title="Team Members">
            <div className="bg-white border border-gray-200 rounded-md">
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Active Members ({organization.OrganizationUser.length})</span>
                  <div className="flex space-x-2">
                    <Link
                      href="/organization/users"
                      className="text-sm text-blue-600 hover:text-blue-500 transition-colors duration-200"
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