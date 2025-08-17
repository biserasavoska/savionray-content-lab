'use client'

import { useState } from 'react'
import Link from 'next/link'

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
      } else {
        const error = await response.json()
        setMessage(`Error: ${error.message}`)
      }
    } catch (error) {
      setMessage('An error occurred while updating settings')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Organization Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                defaultValue={organization.name}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                Organization Slug
              </label>
              <input
                type="text"
                name="slug"
                id="slug"
                defaultValue={organization.slug}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="domain" className="block text-sm font-medium text-gray-700">
                Domain (optional)
              </label>
              <input
                type="text"
                name="domain"
                id="domain"
                defaultValue={organization.domain || ''}
                placeholder="example.com"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700">
                Primary Color
              </label>
              <input
                type="color"
                name="primaryColor"
                id="primaryColor"
                defaultValue={organization.primaryColor || '#3B82F6'}
                className="mt-1 block w-full h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Subscription Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Subscription</h3>
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
        </div>

        {/* Team Members */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Team Members</h3>
          <div className="bg-white border border-gray-200 rounded-md">
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Active Members ({organization.OrganizationUser.length})</span>
                <div className="flex space-x-2">
                  <Link
                    href="/organization/users"
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    Manage Team
                  </Link>
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    Invite Member
                  </button>
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
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                      {orgUser.role.toLowerCase()}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                      {orgUser.User_OrganizationUser_userIdToUser.role.toLowerCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-md ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message}
          </div>
        )}
      </form>
    </div>
  )
} 