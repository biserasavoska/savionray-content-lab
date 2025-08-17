'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { ArrowLeftIcon, PencilIcon, TrashIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'

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

export default function IdeaDetailPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const [idea, setIdea] = useState<Idea | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchIdea(params.id as string)
    }
  }, [params.id])

  const fetchIdea = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/ideas/${id}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Idea not found')
        } else {
          setError('Failed to fetch idea')
        }
        return
      }

      const data = await response.json()
      setIdea(data)
    } catch (error) {
      console.error('Error fetching idea:', error)
      setError('Failed to fetch idea')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!idea) return

    try {
      const response = await fetch(`/api/ideas/${idea.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      const updatedIdea = await response.json()
      setIdea(updatedIdea)
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status')
    }
  }

  const handleDelete = async () => {
    if (!idea || !confirm('Are you sure you want to delete this idea?')) return

    try {
      const response = await fetch(`/api/ideas/${idea.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete idea')
      }

      router.push('/ideas')
    } catch (error) {
      console.error('Error deleting idea:', error)
      alert('Failed to delete idea')
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = 'inline-flex items-center font-medium px-2.5 py-0.5 text-sm rounded-md'
    
    switch (status) {
      case 'PENDING':
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Pending</span>
      case 'APPROVED':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>Approved</span>
      case 'REJECTED':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>Rejected</span>
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{status}</span>
    }
  }

  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case 'SOCIAL_MEDIA_POST':
        return 'Social Media Post'
      case 'NEWSLETTER':
        return 'Newsletter'
      case 'BLOG_POST':
        return 'Blog Post'
      case 'WEBSITE_COPY':
        return 'Website Copy'
      case 'EMAIL_CAMPAIGN':
        return 'Email Campaign'
      default:
        return type
    }
  }

  const getMediaTypeLabel = (type: string) => {
    switch (type) {
      case 'PHOTO':
        return 'Photo'
      case 'VIDEO':
        return 'Video'
      case 'GRAPH_OR_INFOGRAPHIC':
        return 'Infographic'
      case 'SOCIAL_CARD':
        return 'Social Card'
      case 'POLL':
        return 'Poll'
      case 'CAROUSEL':
        return 'Carousel'
      default:
        return type
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p>Loading idea...</p>
        </div>
      </div>
    )
  }

  if (error || !idea) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-red-600">{error || 'Idea not found'}</p>
          <Link href="/ideas" className="text-blue-600 hover:underline mt-4 inline-block">
            Back to Ideas
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/ideas" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Ideas
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{idea.title}</h1>
              <div className="flex items-center gap-2 mt-2">
                {getStatusBadge(idea.status)}
                <span className="text-sm text-gray-500">
                  Created by {idea.User?.name || idea.User?.email || 'Unknown'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push(`/ideas/${idea.id}/edit`)}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center px-3 py-1.5 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>
        <div className="px-6 py-6 space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{idea.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Content Type</h3>
              <p className="text-gray-700">{getContentTypeLabel(idea.contentType)}</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Media Type</h3>
              <p className="text-gray-700">{getMediaTypeLabel(idea.mediaType)}</p>
            </div>
            {idea.publishingDateTime && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Publishing Date</h3>
                <p className="text-gray-700">
                  {new Date(idea.publishingDateTime).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            )}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Created</h3>
              <p className="text-gray-700">
                {new Date(idea.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>

          {idea.status === 'PENDING' && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleStatusChange('APPROVED')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                  Approve Idea
                </button>
                <button
                  onClick={() => handleStatusChange('REJECTED')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <XCircleIcon className="h-4 w-4 mr-2" />
                  Reject Idea
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
