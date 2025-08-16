'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { ArrowLeftIcon, PlusIcon, DocumentTextIcon } from '@heroicons/react/24/outline'

interface Idea {
  id: string
  title: string
  description: string
  status: string
  contentType: string
  mediaType: string
  publishingDateTime: string | null
  createdAt: string
  updatedAt: string
  createdBy: {
    id: string
    name: string
    email: string
  }
}

export default function CreateDraftPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const [idea, setIdea] = useState<Idea | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    body: '',
    contentType: 'SOCIAL_MEDIA_POST',
    metadata: {}
  })

  useEffect(() => {
    if (params.id) {
      fetchIdea()
    }
  }, [params.id])

  const fetchIdea = async () => {
    try {
      const response = await fetch(`/api/ideas/${params.id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch idea')
      }
      const data = await response.json()
      setIdea(data)
      
      // Pre-populate form with idea data
      setFormData(prev => ({
        ...prev,
        body: data.description,
        contentType: data.contentType
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch idea')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setError(null)

    try {
      const response = await fetch('/api/drafts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          ideaId: params.id,
          status: 'DRAFT'
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create draft')
      }

      const draft = await response.json()
      router.push(`/content-review/${draft.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create draft')
    } finally {
      setCreating(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (error && !idea) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/ideas">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Back to Ideas
            </button>
          </Link>
        </div>
      </div>
    )
  }

  if (!idea) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Idea not found</p>
          <Link href="/ideas">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Back to Ideas
            </button>
          </Link>
        </div>
      </div>
    )
  }

  if (idea.status !== 'APPROVED') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Only approved ideas can be used to create drafts.</p>
          <Link href="/ideas">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Back to Ideas
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href={`/ideas/${idea.id}`} className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Idea
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
            <PlusIcon className="h-6 w-6 mr-3 text-blue-600" />
            Create Draft from Idea
          </h1>
        </div>
        
        <div className="px-6 py-6">
          {/* Idea Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{idea.title}</h2>
            <p className="text-gray-600 text-sm mb-3">{idea.description}</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                {idea.contentType.replace(/_/g, ' ')}
              </span>
              {idea.mediaType && (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                  {idea.mediaType.replace(/_/g, ' ')}
                </span>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="contentType" className="block text-sm font-medium text-gray-700 mb-2">
                Content Type
              </label>
              <select
                id="contentType"
                name="contentType"
                value={formData.contentType}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="SOCIAL_MEDIA_POST">Social Media Post</option>
                <option value="NEWSLETTER">Newsletter</option>
                <option value="BLOG_POST">Blog Post</option>
                <option value="WEBSITE_COPY">Website Copy</option>
                <option value="EMAIL_CAMPAIGN">Email Campaign</option>
              </select>
            </div>

            <div>
              <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-2">
                Content Body *
              </label>
              <textarea
                id="body"
                name="body"
                value={formData.body}
                onChange={handleInputChange}
                required
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Write your content here..."
              />
              <p className="text-sm text-gray-500 mt-1">
                Start with the idea description and expand it into full content.
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Link href={`/ideas/${idea.id}`}>
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
              </Link>
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? 'Creating...' : 'Create Draft'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
