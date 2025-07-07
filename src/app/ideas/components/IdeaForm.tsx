'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import FormField, { Input, Textarea, Select, Checkbox } from '@/components/ui/forms/FormField'
import Button from '@/components/ui/common/Button'
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/layout/Card'
import { useFormData } from '@/hooks/useFormData'

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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

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

  // Use our custom form hook
  const form = useFormData({
    initialValues: {
      title: idea?.title || '',
      description: idea?.description || '',
      publishingDateTime: idea?.publishingDateTime ? new Date(idea.publishingDateTime).toISOString().slice(0, 16) : '',
      savedForLater: idea?.savedForLater || false,
      mediaType: idea?.mediaType as MediaType | undefined,
      contentType: idea?.contentType as ContentType | undefined,
    },
    validation: {
      title: (value) => !value.trim() ? 'Title is required' : undefined,
      description: (value) => !value.trim() ? 'Description is required' : undefined,
      contentType: (value) => !value ? 'Content type is required' : undefined,
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.id) return

    const errors = form.validate()
    if (Object.keys(errors).length > 0) {
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch(idea ? `/api/ideas/${idea.id}` : '/api/ideas', {
        method: idea ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form.values,
          publishingDateTime: form.values.publishingDateTime ? new Date(form.values.publishingDateTime).toISOString() : null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save idea')
      }

      onSuccess?.()
      router.push('/ideas')
    } catch (error) {
      console.error('Failed to save idea:', error)
      setError(error instanceof Error ? error.message : 'Failed to save idea. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{idea ? 'Edit Idea' : 'Create New Idea'}</CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}

          <FormField
            label="Title"
            error={form.errors.title}
            required
          >
            <Input
              value={form.values.title}
              onChange={(e) => form.setFieldValue('title', e.target.value)}
              placeholder="Enter idea title"
            />
          </FormField>

          <FormField
            label="Description"
            error={form.errors.description}
            required
          >
            <Textarea
              value={form.values.description}
              onChange={(e) => form.setFieldValue('description', e.target.value)}
              placeholder="Describe your idea"
              rows={4}
            />
          </FormField>

          <FormField
            label="Content Type"
            error={form.errors.contentType}
            required
          >
            <Select
              options={contentTypes}
              value={form.values.contentType || ''}
              onChange={(e) => form.setFieldValue('contentType', e.target.value as ContentType)}
              placeholder="Select a content type"
            />
          </FormField>

          <FormField
            label="Date & Time of Publishing"
          >
            <Input
              type="datetime-local"
              value={form.values.publishingDateTime}
              onChange={(e) => form.setFieldValue('publishingDateTime', e.target.value)}
            />
          </FormField>

          <FormField
            label="Media Type"
          >
            <Select
              options={mediaTypes}
              value={form.values.mediaType || ''}
              onChange={(e) => form.setFieldValue('mediaType', e.target.value as MediaType)}
              placeholder="Select a media type"
            />
          </FormField>

          <FormField>
            <Checkbox
              checked={form.values.savedForLater}
              onChange={(e) => form.setFieldValue('savedForLater', e.target.checked)}
              label="Save for later"
            />
          </FormField>
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
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : idea ? 'Update Idea' : 'Create Idea'}
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
} 