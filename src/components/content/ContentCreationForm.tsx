'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'

import { useInterface } from '@/hooks/useInterface'
import Button from '@/components/ui/common/Button'
import Badge from '@/components/ui/common/Badge'

interface ContentCreationFormProps {
  onSubmit: (data: ContentFormData) => void
  onCancel: () => void
  initialData?: Partial<ContentFormData>
}

export interface ContentFormData {
  title: string
  description: string
  contentType: 'BLOG_POST' | 'SOCIAL_MEDIA' | 'NEWSLETTER' | 'WEBSITE_CONTENT'
  mediaType: 'TEXT' | 'IMAGE' | 'VIDEO' | 'MIXED'
  targetAudience: string
  keywords: string[]
  aiAssistance: boolean
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  deadline?: Date
  notes: string
}

export default function ContentCreationForm({
  onSubmit,
  onCancel,
  initialData = {}
}: ContentCreationFormProps) {
  const { data: session } = useSession()
  const interfaceContext = useInterface()
  const [formData, setFormData] = useState<ContentFormData>({
    title: '',
    description: '',
    contentType: 'BLOG_POST',
    mediaType: 'TEXT',
    targetAudience: '',
    keywords: [],
    aiAssistance: false,
    priority: 'MEDIUM',
    deadline: undefined,
    notes: '',
    ...initialData
  })

  const isCreativeUser = interfaceContext.isCreative
  const isClientUser = interfaceContext.isClient
  const isAdminUser = interfaceContext.isAdmin

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleInputChange = (field: keyof ContentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addKeyword = (keyword: string) => {
    if (keyword.trim() && !formData.keywords.includes(keyword.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keyword.trim()]
      }))
    }
  }

  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }))
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Create New Content
        </h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Role:</span>
          <Badge variant={isCreativeUser ? 'default' : isClientUser ? 'default' : 'secondary'}>
            {isCreativeUser ? 'Creative' : isClientUser ? 'Client' : 'Admin'}
          </Badge>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter content title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content Type *
            </label>
            <select
              value={formData.contentType}
              onChange={(e) => handleInputChange('contentType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="BLOG_POST">Blog Post</option>
              <option value="SOCIAL_MEDIA">Social Media</option>
              <option value="NEWSLETTER">Newsletter</option>
              <option value="WEBSITE_CONTENT">Website Content</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe the content you want to create..."
            required
          />
        </div>

        {/* Creative User Features */}
        {isCreativeUser && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Media Type
                </label>
                <select
                  value={formData.mediaType}
                  onChange={(e) => handleInputChange('mediaType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="TEXT">Text Only</option>
                  <option value="IMAGE">Image</option>
                  <option value="VIDEO">Video</option>
                  <option value="MIXED">Mixed Media</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority Level
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Audience
              </label>
              <input
                type="text"
                value={formData.targetAudience}
                onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., B2B professionals, millennials, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Keywords
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.keywords.map((keyword, index) => (
                  <Badge key={index} variant="default" className="cursor-pointer" onClick={() => removeKeyword(keyword)}>
                    {keyword} ×
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add keyword"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addKeyword(e.currentTarget.value)
                      e.currentTarget.value = ''
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="Add keyword"]') as HTMLInputElement
                    if (input) {
                      addKeyword(input.value)
                      input.value = ''
                    }
                  }}
                >
                  Add
                </Button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="aiAssistance"
                checked={formData.aiAssistance}
                onChange={(e) => handleInputChange('aiAssistance', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="aiAssistance" className="ml-2 block text-sm text-gray-700">
                Enable AI assistance for content creation
              </label>
            </div>
          </>
        )}

        {/* Client User Features */}
        {isClientUser && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Requirements
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Any specific requirements, brand guidelines, or feedback..."
            />
          </div>
        )}

        {/* Admin User Features */}
        {isAdminUser && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deadline
                </label>
                <input
                  type="date"
                  value={formData.deadline ? formData.deadline.toISOString().split('T')[0] : ''}
                  onChange={(e) => handleInputChange('deadline', e.target.value ? new Date(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority Level
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Internal notes, resource allocation, or special instructions..."
              />
            </div>
          </>
        )}

        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="default">
            {isCreativeUser ? 'Create Content' : isClientUser ? 'Submit Request' : 'Create Content Request'}
          </Button>
        </div>
      </form>
    </div>
  )
} 