'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

import { formatDate } from '../../../../lib/utils/date-helpers'
import type { ContentDraft, Idea, User, Media } from '../../../../types/content'

import MediaUpload from './MediaUpload'

import RichTextEditor from '@/components/editor/RichTextEditor'

type ContentDraftWithDetails = ContentDraft & {
  idea: Idea & {
    createdBy: Pick<User, 'name' | 'email'>
  }
  createdBy: Pick<User, 'name' | 'email'>
  media: Media[]
}

// Local Feedback type
interface Feedback {
  id: string
  comment: string
  createdAt: Date
  createdBy: User
  contentDraftId: string
}

export default function ReadyContentEditPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [content, setContent] = useState<ContentDraftWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [body, setBody] = useState('')

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchContent()
  }, [session, params.id])

  const fetchContent = async () => {
    try {
      const response = await fetch(`/api/content-drafts/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setContent(data)
        setBody(data.body)
      } else {
        console.error('Failed to fetch content')
        router.push('/ready-content')
      }
    } catch (error) {
      console.error('Error fetching content:', error)
      router.push('/ready-content')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!content) return

    setSaving(true)
    try {
      const response = await fetch(`/api/content-drafts/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          body,
        }),
      })

      if (response.ok) {
        // Update local state
        setContent(prev => prev ? { ...prev, body } : null)
        alert('Content saved successfully!')
      } else {
        alert('Failed to save content. Please try again.')
      }
    } catch (error) {
      console.error('Error saving content:', error)
      alert('Error saving content. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleStatusUpdate = async (newStatus: string) => {
    if (!content) return

    setSaving(true)
    try {
      const response = await fetch(`/api/content-drafts/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      })

      if (response.ok) {
        // Update local state with proper typing
        setContent(prev => prev ? { ...prev, status: newStatus as any } : null)
        alert(`Status updated to ${newStatus}!`)
        router.push('/ready-content')
      } else {
        alert('Failed to update status. Please try again.')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Error updating status. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800'
      case 'AWAITING_FEEDBACK':
        return 'bg-yellow-100 text-yellow-800'
      case 'PUBLISHED':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'Ready to Publish'
      case 'AWAITING_FEEDBACK':
        return 'Awaiting Review'
      case 'PUBLISHED':
        return 'Published'
      default:
        return status.replace(/_/g, ' ')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    )
  }

  if (!content) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Content Not Found</h1>
          <p className="text-gray-600 mb-4">The content you're looking for doesn't exist or you don't have permission to access it.</p>
          <button
            onClick={() => router.push('/ready-content')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
          >
            Back to Ready Content
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Content</h1>
            <p className="text-gray-600 mt-2">
              {content.idea?.title || 'Untitled Idea'}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusColor(content.status)}`}>
              {getStatusLabel(content.status)}
            </span>
            <button
              onClick={() => router.push('/ready-content')}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Back to List
            </button>
          </div>
        </div>

        {/* Content Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Created by:</span>
              <p className="text-gray-600">{content.createdBy?.name || content.createdBy?.email || 'Unknown'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Content Type:</span>
              <p className="text-gray-600">{content.contentType.replace(/_/g, ' ')}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Last Updated:</span>
              <p className="text-gray-600">{formatDate(content.updatedAt)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Editor */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Content</h2>
        <RichTextEditor
          content={body}
          onChange={setBody}
          placeholder="Enter your content here..."
        />
      </div>

      {/* Media Upload */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Media Attachments</h2>
        <MediaUpload contentId={content.id} />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <div className="flex space-x-3">
          {content.status === 'AWAITING_FEEDBACK' && (
            <>
              <button
                onClick={() => handleStatusUpdate('APPROVED')}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Updating...' : 'Approve'}
              </button>
              <button
                onClick={() => handleStatusUpdate('AWAITING_REVISION')}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Updating...' : 'Request Revision'}
              </button>
            </>
          )}

          {content.status === 'APPROVED' && (
            <button
              onClick={() => handleStatusUpdate('PUBLISHED')}
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Publishing...' : 'Publish'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
} 