'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface CreateOrganizationFormProps {}

export default function CreateOrganizationForm({}: CreateOrganizationFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    domain: '',
    primaryColor: '#3B82F6',
    subscriptionPlan: 'FREE',
    maxUsers: 5,
    clientEmails: '',
    adminEmails: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Auto-generate slug from name
    if (name === 'name') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
      setFormData(prev => ({
        ...prev,
        slug
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Parse email lists
      const clientEmails = formData.clientEmails
        .split(',')
        .map(email => email.trim())
        .filter(email => email.length > 0)
      
      const adminEmails = formData.adminEmails
        .split(',')
        .map(email => email.trim())
        .filter(email => email.length > 0)

      const response = await fetch('/api/admin/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          clientEmails,
          adminEmails
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Organization created successfully!')
        setTimeout(() => {
          router.push('/admin/organizations')
        }, 2000)
      } else {
        setError(data.error || 'Failed to create organization')
      }
    } catch (error) {
      setError('An error occurred while creating the organization')
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
                Organization Name *
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                Organization Slug *
              </label>
              <input
                type="text"
                name="slug"
                id="slug"
                value={formData.slug}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <p className="mt-1 text-xs text-gray-500">URL-friendly identifier (auto-generated from name)</p>
            </div>

            <div>
              <label htmlFor="domain" className="block text-sm font-medium text-gray-700">
                Domain (optional)
              </label>
              <input
                type="text"
                name="domain"
                id="domain"
                value={formData.domain}
                onChange={handleInputChange}
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
                value={formData.primaryColor}
                onChange={handleInputChange}
                className="mt-1 block w-full h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Subscription Settings */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Subscription Settings</h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="subscriptionPlan" className="block text-sm font-medium text-gray-700">
                Subscription Plan
              </label>
              <select
                name="subscriptionPlan"
                id="subscriptionPlan"
                value={formData.subscriptionPlan}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="FREE">Free</option>
                <option value="STARTER">Starter</option>
                <option value="PROFESSIONAL">Professional</option>
                <option value="ENTERPRISE">Enterprise</option>
              </select>
            </div>

            <div>
              <label htmlFor="maxUsers" className="block text-sm font-medium text-gray-700">
                Maximum Users
              </label>
              <input
                type="number"
                name="maxUsers"
                id="maxUsers"
                value={formData.maxUsers}
                onChange={handleInputChange}
                min="1"
                max="100"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Team Setup */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Team Setup</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="clientEmails" className="block text-sm font-medium text-gray-700">
                Client Email Addresses
              </label>
              <textarea
                name="clientEmails"
                id="clientEmails"
                value={formData.clientEmails}
                onChange={(e) => setFormData(prev => ({ ...prev, clientEmails: e.target.value }))}
                placeholder="client1@example.com, client2@example.com"
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">Comma-separated list of client email addresses</p>
            </div>

            <div>
              <label htmlFor="adminEmails" className="block text-sm font-medium text-gray-700">
                Admin Email Addresses
              </label>
              <textarea
                name="adminEmails"
                id="adminEmails"
                value={formData.adminEmails}
                onChange={(e) => setFormData(prev => ({ ...prev, adminEmails: e.target.value }))}
                placeholder="admin1@example.com, admin2@example.com"
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">Comma-separated list of admin email addresses</p>
            </div>
          </div>
        </div>

        {/* Error and Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.push('/admin/organizations')}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating...' : 'Create Organization'}
          </button>
        </div>
      </form>
    </div>
  )
} 