'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { FormField, Input, Textarea, Select, Checkbox } from '@/components/ui/common/FormField'
import Button from '@/components/ui/common/Button'
import Card, { CardHeader, CardContent, CardFooter } from '@/components/ui/common/Card'
import { useFormData } from '@/components/ui/common/hooks'
import { useOrganization } from '@/lib/contexts/OrganizationContext'
import { isAdmin } from '@/lib/auth'
import { useApiHeaders } from '@/lib/utils/api-helpers'

type MediaType = 'PHOTO' | 'GRAPH_OR_INFOGRAPHIC' | 'VIDEO' | 'SOCIAL_CARD' | 'POLL' | 'CAROUSEL'
type ContentType = 'NEWSLETTER' | 'BLOG_POST' | 'SOCIAL_MEDIA_POST' | 'WEBSITE_COPY' | 'EMAIL_CAMPAIGN'

interface IdeaFormProps {
  idea?: {
    id: string
    title: string
    description: string
    publishingDateTime: Date | null
    savedForLater: boolean
    mediaType: MediaType | null
    contentType: ContentType | null
  }
  onSuccess?: () => void
}

interface FormData {
  title: string
  description: string
  publishingDateTime: string
  savedForLater: boolean
  mediaType: MediaType | undefined
  contentType: ContentType | undefined
}

export default function IdeaForm({ idea, onSuccess }: IdeaFormProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const { currentOrganization, userOrganizations } = useOrganization()
  const apiHeaders = useApiHeaders()

  const mediaTypes = [
    { value: 'PHOTO' as MediaType, label: 'Photo' },
    { value: 'GRAPH_OR_INFOGRAPHIC' as MediaType, label: 'Graph or Infographic' },
    { value: 'VIDEO' as MediaType, label: 'Video' },
    { value: 'SOCIAL_CARD' as MediaType, label: 'Social Card' },
    { value: 'POLL' as MediaType, label: 'Poll' },
    { value: 'CAROUSEL' as MediaType, label: 'Carousel' },
  ]

  const contentTypes = [
    { value: 'NEWSLETTER' as ContentType, label: 'Newsletter' },
    { value: 'BLOG_POST' as ContentType, label: 'Blog Post' },
    { value: 'SOCIAL_MEDIA_POST' as ContentType, label: 'Social Media Post' },
    { value: 'WEBSITE_COPY' as ContentType, label: 'Website Copy' },
    { value: 'EMAIL_CAMPAIGN' as ContentType, label: 'Email Campaign' },
  ]

  // Use the new form hook
  const { formData, updateFormData, errors, loading, handleSubmit } = useFormData({
    initialData: {
      title: idea?.title || '',
      description: idea?.description || '',
      publishingDateTime: idea?.publishingDateTime ? new Date(idea.publishingDateTime).toISOString().slice(0, 16) : '',
      savedForLater: idea?.savedForLater || false,
      mediaType: idea?.mediaType as MediaType | undefined,
      contentType: idea?.contentType as ContentType | undefined,
    },
    onValidate: (data) => {
      const validationErrors: Record<string, string> = {}
      
      if (!data.title.trim()) {
        validationErrors.title = 'Title is required'
      }
      
      if (!data.description.trim()) {
        validationErrors.description = 'Description is required'
      }
      
      if (!data.contentType) {
        validationErrors.contentType = 'Content type is required'
      }
      
      return Object.keys(validationErrors).length > 0 ? validationErrors : null
    },
    onSubmit: async (data) => {
      if (!session?.user?.id) return

      const response = await fetch(idea ? `/api/ideas/${idea.id}` : '/api/ideas', {
        method: idea ? 'PUT' : 'POST',
        headers: apiHeaders,
        body: JSON.stringify({
          ...data,
          publishingDateTime: data.publishingDateTime ? new Date(data.publishingDateTime).toISOString() : null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save idea')
      }

      onSuccess?.()
      router.push('/ideas')
    }
  })

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">{idea ? 'Edit Idea' : 'Create New Idea'}</h2>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {errors.submit && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{errors.submit}</h3>
                </div>
              </div>
            </div>
          )}

          <FormField
            label="Title"
            error={errors.title}
            required
          >
            <Input
              value={formData.title}
              onChange={(e) => updateFormData('title', e.target.value)}
              placeholder="Enter idea title"
            />
          </FormField>

          <FormField
            label="Description"
            error={errors.description}
            required
          >
            <Textarea
              value={formData.description}
              onChange={(e) => updateFormData('description', e.target.value)}
              placeholder="Describe your idea"
              rows={4}
            />
          </FormField>

          <FormField
            label="Content Type"
            error={errors.contentType}
            required
          >
            <Select
              options={contentTypes}
              value={formData.contentType || ''}
              onChange={(value) => updateFormData('contentType', value as ContentType)}
            />
          </FormField>

          <FormField
            label="Date & Time of Publishing"
          >
            <Input
              type="datetime-local"
              value={formData.publishingDateTime}
              onChange={(e) => updateFormData('publishingDateTime', e.target.value)}
            />
          </FormField>

          <FormField
            label="Media Type"
          >
            <Select
              options={mediaTypes}
              value={formData.mediaType || ''}
              onChange={(value) => updateFormData('mediaType', value as MediaType)}
            />
          </FormField>

          <FormField>
            <Checkbox
              checked={formData.savedForLater}
              onChange={(e) => updateFormData('savedForLater', e.target.checked)}
              label="Save for later"
            />
          </FormField>

          {/* Organization Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Organization</h3>
            {currentOrganization ? (
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                  style={{ 
                    backgroundColor: currentOrganization.primaryColor || '#3B82F6' 
                  }}
                >
                  {currentOrganization.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{currentOrganization.name}</p>
                  <p className="text-sm text-gray-500">
                    This idea will be created for {currentOrganization.name}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No organization selected</p>
            )}
          </div>
        </CardContent>

        <CardFooter>
          <div className="flex justify-end space-x-3 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/ideas')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
            >
              {idea ? 'Update Idea' : 'Create Idea'}
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
} 