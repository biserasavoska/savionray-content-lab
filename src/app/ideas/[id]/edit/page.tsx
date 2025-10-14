'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { ArrowLeftIcon, PencilIcon } from '@heroicons/react/24/outline'
import SimpleRichTextEditor from '@/components/ui/SimpleRichTextEditor'
import { useOrganization } from '@/lib/contexts/OrganizationContext'

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

export default function EditIdeaPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const { currentOrganization } = useOrganization()
  const [idea, setIdea] = useState<Idea | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    contentType: 'social-media',
    mediaType: 'image',
    publishingDateTime: '',
    savedForLater: false
  })

  useEffect(() => {
    if (params.id && currentOrganization?.id) {
      fetchIdea()
    }
  }, [params.id, currentOrganization?.id])

  const fetchIdea = async () => {
    try {
      if (!currentOrganization?.id) {
        setError('No organization context available')
        setLoading(false)
        return
      }

      const response = await fetch(`/api/ideas/${params.id}`, {
        headers: {
          'x-selected-organization': currentOrganization.id,
        },
      })
      if (!response.ok) {
        throw new Error('Failed to fetch idea')
      }
      const data = await response.json()
      setIdea(data)
      
      // Map enum values back to form values
      const mapContentTypeToForm = (type: string) => {
        switch (type) {
          case 'SOCIAL_MEDIA_POST': return 'social-media'
          case 'NEWSLETTER': return 'newsletter'
          case 'BLOG_POST': return 'blog-post'
          case 'WEBSITE_COPY': return 'website-copy'
          case 'EMAIL_CAMPAIGN': return 'email-campaign'
          default: return 'social-media'
        }
      }

      const mapMediaTypeToForm = (type: string) => {
        switch (type) {
          case 'PHOTO': return 'image'
          case 'VIDEO': return 'video'
          case 'GRAPH_OR_INFOGRAPHIC': return 'infographic'
          case 'SOCIAL_CARD': return 'social-card'
          case 'POLL': return 'poll'
          case 'CAROUSEL': return 'carousel'
          default: return 'image'
        }
      }

      setFormData({
        title: data.title,
        description: data.description,
        contentType: mapContentTypeToForm(data.contentType),
        mediaType: mapMediaTypeToForm(data.mediaType),
        publishingDateTime: data.publishingDateTime ? new Date(data.publishingDateTime).toISOString().split('T')[0] : '',
        savedForLater: data.savedForLater || false
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch idea')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentOrganization?.id) {
      setError('No organization context available')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/ideas/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-selected-organization': currentOrganization.id,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to update idea')
      }

      router.push(`/ideas/${params.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update idea')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
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
            <PencilIcon className="h-6 w-6 mr-3 text-blue-600" />
            Edit Idea
          </h1>
        </div>
        
        <div className="px-6 py-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter idea title"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <SimpleRichTextEditor
                content={formData.description}
                onContentChange={(content) => setFormData(prev => ({ ...prev, description: content }))}
                placeholder="Describe your content idea in detail..."
                className="min-h-[200px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="contentType" className="block text-sm font-medium text-gray-700 mb-2">
                  Content Type *
                </label>
                <select
                  id="contentType"
                  name="contentType"
                  value={formData.contentType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="social-media">Social Media Post</option>
                  <option value="newsletter">Newsletter</option>
                  <option value="blog-post">Blog Post</option>
                  <option value="website-copy">Website Copy</option>
                  <option value="email-campaign">Email Campaign</option>
                </select>
              </div>

              <div>
                <label htmlFor="mediaType" className="block text-sm font-medium text-gray-700 mb-2">
                  Media Type *
                </label>
                <select
                  id="mediaType"
                  name="mediaType"
                  value={formData.mediaType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                  <option value="infographic">Infographic</option>
                  <option value="social-card">Social Card</option>
                  <option value="poll">Poll</option>
                  <option value="carousel">Carousel</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="publishingDateTime" className="block text-sm font-medium text-gray-700 mb-2">
                Publishing Date (Optional)
              </label>
              <input
                type="date"
                id="publishingDateTime"
                name="publishingDateTime"
                value={formData.publishingDateTime}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="savedForLater"
                name="savedForLater"
                checked={formData.savedForLater}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="savedForLater" className="ml-2 block text-sm text-gray-700">
                Save for later
              </label>
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
                disabled={saving}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
