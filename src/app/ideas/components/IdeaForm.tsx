'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Idea, IdeaStatus, ContentType } from '@prisma/client'

type MediaType = 'PHOTO' | 'GRAPH_OR_INFOGRAPHIC' | 'VIDEO' | 'SOCIAL_CARD' | 'POLL' | 'CAROUSEL'

interface IdeaFormProps {
  idea?: Idea & {
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
  const [formData, setFormData] = useState<FormData>({
    title: idea?.title || '',
    description: idea?.description || '',
    publishingDateTime: idea?.publishingDateTime ? new Date(idea.publishingDateTime).toISOString().slice(0, 16) : '',
    savedForLater: idea?.savedForLater || false,
    mediaType: idea?.mediaType as MediaType | undefined,
    contentType: idea?.contentType as ContentType | undefined,
  })

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.id) return

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch(idea ? `/api/ideas/${idea.id}` : '/api/ideas', {
        method: idea ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          publishingDateTime: formData.publishingDateTime ? new Date(formData.publishingDateTime).toISOString() : null,
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700"
        >
          Title
        </label>
        <div className="mt-1">
          <input
            type="text"
            name="title"
            id="title"
            required
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Description
        </label>
        <div className="mt-1">
          <textarea
            id="description"
            name="description"
            required
            rows={4}
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="contentType"
          className="block text-sm font-medium text-gray-700"
        >
          Content Type
        </label>
        <div className="mt-1">
          <select
            id="contentType"
            name="contentType"
            required
            value={formData.contentType || ''}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, contentType: (e.target.value || undefined) as ContentType | undefined }))
            }
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
          >
            <option value="">Select a content type</option>
            {contentTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label
          htmlFor="publishingDateTime"
          className="block text-sm font-medium text-gray-700"
        >
          Date & Time of Publishing
        </label>
        <div className="mt-1">
          <input
            type="datetime-local"
            id="publishingDateTime"
            name="publishingDateTime"
            value={formData.publishingDateTime}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, publishingDateTime: e.target.value }))
            }
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="mediaType"
          className="block text-sm font-medium text-gray-700"
        >
          Media Type
        </label>
        <div className="mt-1">
          <select
            id="mediaType"
            name="mediaType"
            value={formData.mediaType || ''}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, mediaType: (e.target.value || undefined) as MediaType | undefined }))
            }
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
          >
            <option value="">Select a media type</option>
            {mediaTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="savedForLater"
          name="savedForLater"
          checked={formData.savedForLater}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, savedForLater: e.target.checked }))
          }
          className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
        />
        <label
          htmlFor="savedForLater"
          className="ml-2 block text-sm text-gray-700"
        >
          Save for later
        </label>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.push('/ideas')}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : idea ? 'Update Idea' : 'Create Idea'}
        </button>
      </div>
    </form>
  )
} 