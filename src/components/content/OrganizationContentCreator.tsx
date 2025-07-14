'use client'

import React, { useState, useEffect } from 'react'

import { useOrganization } from '@/lib/contexts/OrganizationContext'
import Card from '@/components/ui/layout/Card'
import Button from '@/components/ui/common/Button'
import Badge from '@/components/ui/common/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface ContentTemplate {
  id: string
  name: string
  description: string
  contentType: string
  format: string
  organizationId: string
  isDefault: boolean
}

interface OrganizationContentCreatorProps {
  onContentCreated?: (content: any) => void
}

export default function OrganizationContentCreator({ 
  onContentCreated 
}: OrganizationContentCreatorProps) {
  const { currentOrganization } = useOrganization()
  const [templates, setTemplates] = useState<ContentTemplate[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<ContentTemplate | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    additionalContext: '',
    format: 'social-media',
    model: 'gpt-4'
  })

  useEffect(() => {
    if (currentOrganization?.id) {
      fetchOrganizationTemplates()
    }
  }, [currentOrganization?.id])

  const fetchOrganizationTemplates = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/organization/${currentOrganization?.id}/templates`)
      
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates || [])
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTemplateSelect = (template: ContentTemplate) => {
    setSelectedTemplate(template)
    setFormData(prev => ({
      ...prev,
      format: template.format,
      description: template.description
    }))
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleContentGeneration = async () => {
    if (!currentOrganization?.id || !formData.title || !formData.description) {
      return
    }

    try {
      setIsLoading(true)
      
      const response = await fetch('/api/content/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          organizationId: currentOrganization.id,
          templateId: selectedTemplate?.id
        }),
      })

      if (response.ok) {
        const content = await response.json()
        onContentCreated?.(content)
        
        // Reset form
        setFormData({
          title: '',
          description: '',
          additionalContext: '',
          format: 'social-media',
          model: 'gpt-4'
        })
        setSelectedTemplate(null)
      } else {
        const error = await response.json()
        console.error('Content generation failed:', error)
      }
    } catch (error) {
      console.error('Error generating content:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!currentOrganization) {
    return (
      <Card>
        <div className="p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Organization Selected
          </h3>
          <p className="text-gray-500">
            Please select an organization to create content.
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Organization Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Create Content for {currentOrganization.name}
          </h2>
          <p className="text-gray-600 mt-1">
            Generate content using organization-specific templates and settings
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">
            {currentOrganization.subscriptionPlan || 'Standard'}
          </Badge>
          <Badge variant={currentOrganization.subscriptionStatus === 'active' ? 'success' : 'warning'}>
            {currentOrganization.subscriptionStatus || 'Unknown'}
          </Badge>
        </div>
      </div>

      {/* Content Templates */}
      {templates.length > 0 && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Organization Templates
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    selectedTemplate?.id === template.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{template.name}</h4>
                    {template.isDefault && (
                      <Badge variant="primary" size="sm">Default</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" size="sm">{template.contentType}</Badge>
                    <Badge variant="secondary" size="sm">{template.format}</Badge>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Content Creation Form */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Content Details
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter content title..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the content you want to create..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Context
              </label>
              <textarea
                value={formData.additionalContext}
                onChange={(e) => handleInputChange('additionalContext', e.target.value)}
                placeholder="Any additional context, tone, or specific requirements..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Format
                </label>
                <select
                  value={formData.format}
                  onChange={(e) => handleInputChange('format', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="social-media">Social Media Post</option>
                  <option value="blog-post">Blog Post</option>
                  <option value="email">Email</option>
                  <option value="advertisement">Advertisement</option>
                  <option value="newsletter">Newsletter</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  AI Model
                </label>
                <select
                  value={formData.model}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="claude-3">Claude 3</option>
                </select>
              </div>
            </div>

            {selectedTemplate && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="primary" size="sm">Using Template</Badge>
                  <span className="font-medium text-blue-900">{selectedTemplate.name}</span>
                </div>
                <p className="text-sm text-blue-700">{selectedTemplate.description}</p>
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Content will be created for {currentOrganization.name}
            </div>
            <Button
              onClick={handleContentGeneration}
              disabled={isLoading || !formData.title || !formData.description}
              className="flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Generate Content</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
} 