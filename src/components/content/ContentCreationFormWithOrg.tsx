'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CONTENT_TYPE, MEDIA_TYPE } from '@/lib/utils/enum-constants'
import OrganizationSelector from './OrganizationSelector'

interface ContentFormData {
  title: string
  description: string
  body?: string
  contentType: string
  mediaType?: string
  metadata?: Record<string, any>
  assignedToId?: string
  deliveryItemId?: string
  organizationId?: string
}

interface ContentCreationFormWithOrgProps {
  onSubmit?: (data: ContentFormData) => void
  onCancel?: () => void
  initialData?: Partial<ContentFormData>
  showOrganizationSelector?: boolean
  allowOrganizationOverride?: boolean
}

export default function ContentCreationFormWithOrg({
  onSubmit,
  onCancel,
  initialData = {},
  showOrganizationSelector = true,
  allowOrganizationOverride = true
}: ContentCreationFormWithOrgProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<ContentFormData>({
    title: '',
    description: '',
    body: '',
    contentType: CONTENT_TYPE.BLOG_POST,
    mediaType: MEDIA_TYPE.PHOTO,
    metadata: {},
    ...initialData
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      // Validate form
      const validationErrors: Record<string, string> = {}
      
      if (!formData.title.trim()) {
        validationErrors.title = 'Title is required'
      }
      
      if (!formData.description.trim()) {
        validationErrors.description = 'Description is required'
      }
      
      if (!formData.contentType) {
        validationErrors.contentType = 'Content type is required'
      }

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors)
        return
      }

      // If onSubmit is provided, use it, otherwise make API call
      if (onSubmit) {
        await onSubmit(formData)
      } else {
        const response = await fetch('/api/content-items', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to create content item')
        }

        const result = await response.json()
        router.push(`/content-items/${result.id}`)
      }
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : 'An error occurred'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof ContentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {showOrganizationSelector && allowOrganizationOverride && (
        <OrganizationSelector
          selectedOrganizationId={formData.organizationId}
          onOrganizationChange={(orgId) => handleInputChange('organizationId', orgId)}
          className="mb-6"
        />
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Title *
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          className={`
            block w-full px-3 py-2 border rounded-md shadow-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${errors.title ? 'border-red-300' : 'border-gray-300'}
          `}
          placeholder="Enter content title"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={3}
          className={`
            block w-full px-3 py-2 border rounded-md shadow-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${errors.description ? 'border-red-300' : 'border-gray-300'}
          `}
          placeholder="Enter content description"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      <div>
        <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-2">
          Content Body
        </label>
        <textarea
          id="body"
          value={formData.body || ''}
          onChange={(e) => handleInputChange('body', e.target.value)}
          rows={6}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter content body (optional)"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="contentType" className="block text-sm font-medium text-gray-700 mb-2">
            Content Type *
          </label>
          <select
            id="contentType"
            value={formData.contentType}
            onChange={(e) => handleInputChange('contentType', e.target.value)}
            className={`
              block w-full px-3 py-2 border rounded-md shadow-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              ${errors.contentType ? 'border-red-300' : 'border-gray-300'}
            `}
          >
            {Object.values(CONTENT_TYPE).map((type) => (
              <option key={type} value={type}>
                {type.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
          {errors.contentType && (
            <p className="mt-1 text-sm text-red-600">{errors.contentType}</p>
          )}
        </div>

        <div>
          <label htmlFor="mediaType" className="block text-sm font-medium text-gray-700 mb-2">
            Media Type
          </label>
          <select
            id="mediaType"
            value={formData.mediaType || ''}
            onChange={(e) => handleInputChange('mediaType', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select media type</option>
            {Object.values(MEDIA_TYPE).map((type) => (
              <option key={type} value={type}>
                {type.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{errors.submit}</p>
        </div>
      )}

      <div className="flex justify-end space-x-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating...' : 'Create Content'}
        </button>
      </div>
    </form>
  )
} 