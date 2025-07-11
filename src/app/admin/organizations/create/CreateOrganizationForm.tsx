'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ClientUser {
  id: string
  email: string
  name: string
  role: 'CLIENT' | 'ADMIN' | 'CREATIVE'
  organizationRole: 'OWNER' | 'ADMIN' | 'MANAGER' | 'MEMBER' | 'VIEWER'
}

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
    welcomeMessage: '',
    clientUsers: [] as ClientUser[]
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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

  const addClientUser = () => {
    const newUser: ClientUser = {
      id: Date.now().toString(),
      email: '',
      name: '',
      role: 'CLIENT',
      organizationRole: 'ADMIN'
    }
    setFormData(prev => ({
      ...prev,
      clientUsers: [...prev.clientUsers, newUser]
    }))
  }

  const removeClientUser = (id: string) => {
    setFormData(prev => ({
      ...prev,
      clientUsers: prev.clientUsers.filter(user => user.id !== id)
    }))
  }

  const updateClientUser = (id: string, field: keyof ClientUser, value: string) => {
    setFormData(prev => ({
      ...prev,
      clientUsers: prev.clientUsers.map(user => 
        user.id === id ? { ...user, [field]: value } : user
      )
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Validate client users
      const validClientUsers = formData.clientUsers.filter(user => 
        user.email.trim() && user.name.trim()
      )

      if (validClientUsers.length === 0) {
        setError('At least one client user is required')
        setIsLoading(false)
        return
      }

      // Check for duplicate emails
      const emails = validClientUsers.map(user => user.email.toLowerCase())
      const uniqueEmails = new Set(emails)
      if (emails.length !== uniqueEmails.size) {
        setError('Duplicate email addresses are not allowed')
        setIsLoading(false)
        return
      }

      const response = await fetch('/api/admin/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          clientUsers: validClientUsers,
          welcomeMessage: formData.welcomeMessage || `Welcome to ${formData.name}!`
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

        {/* Welcome Message */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Welcome Message</h3>
          <div>
            <label htmlFor="welcomeMessage" className="block text-sm font-medium text-gray-700">
              Custom Welcome Message
            </label>
            <textarea
              name="welcomeMessage"
              id="welcomeMessage"
              value={formData.welcomeMessage}
              onChange={handleInputChange}
              placeholder={`Welcome to ${formData.name || 'your organization'}!`}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">This message will be shown to users when they first access the organization</p>
          </div>
        </div>

        {/* Client Users Setup */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Client Users</h3>
            <button
              type="button"
              onClick={addClientUser}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              + Add User
            </button>
          </div>
          
          {formData.clientUsers.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500">No client users added yet</p>
              <p className="text-sm text-gray-400 mt-1">Click "Add User" to add the first client user</p>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.clientUsers.map((user, index) => (
                <div key={user.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-sm font-medium text-gray-900">User {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeClientUser(user.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        value={user.name}
                        onChange={(e) => updateClientUser(user.id, 'name', e.target.value)}
                        placeholder="Full Name"
                        className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={user.email}
                        onChange={(e) => updateClientUser(user.id, 'email', e.target.value)}
                        placeholder="user@example.com"
                        className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        System Role
                      </label>
                      <select
                        value={user.role}
                        onChange={(e) => updateClientUser(user.id, 'role', e.target.value)}
                        className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="CLIENT">Client</option>
                        <option value="ADMIN">Admin</option>
                        <option value="CREATIVE">Creative</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Organization Role
                      </label>
                      <select
                        value={user.organizationRole}
                        onChange={(e) => updateClientUser(user.id, 'organizationRole', e.target.value)}
                        className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="OWNER">Owner</option>
                        <option value="ADMIN">Admin</option>
                        <option value="MANAGER">Manager</option>
                        <option value="MEMBER">Member</option>
                        <option value="VIEWER">Viewer</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
            disabled={isLoading || formData.clientUsers.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating...' : 'Create Organization'}
          </button>
        </div>
      </form>
    </div>
  )
} 