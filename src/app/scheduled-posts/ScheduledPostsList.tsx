'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow, format } from 'date-fns'
import { useOrganization } from '@/lib/contexts/OrganizationContext'

interface Creator {
  name: string | null
  email: string | null
}

interface ContentDraft {
  id: string
  body: string
  User: Creator
  Idea: {
    title: string
  }
}

interface ScheduledPost {
  id: string
  scheduledDate: Date
  status: 'SCHEDULED' | 'PUBLISHED' | 'FAILED'
  contentDraft: ContentDraft
  createdAt: Date
  updatedAt: Date
}

interface ScheduledPostsListProps {}

export default function ScheduledPostsList({}: ScheduledPostsListProps) {
  const router = useRouter()
  const { currentOrganization } = useOrganization()
  const [posts, setPosts] = useState<ScheduledPost[]>([])
  const [loading, setLoading] = useState(true)
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Fetch scheduled posts data
  useEffect(() => {
    const fetchPosts = async () => {
      if (!currentOrganization) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/scheduled-posts', {
          headers: {
            'x-selected-organization': currentOrganization.id
          }
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch scheduled posts')
        }
        
        const data = await response.json()
        setPosts(data.posts || [])
      } catch (err) {
        console.error('Error fetching scheduled posts:', err)
        setError('Failed to load scheduled posts')
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [currentOrganization])

  const handleCancelSchedule = async (postId: string) => {
    if (!confirm('Are you sure you want to cancel this scheduled post?')) {
      return
    }

    setIsLoading(postId)
    setError(null)

    try {
      const response = await fetch(`/api/scheduled-posts/${postId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to cancel scheduled post')
      }

      router.refresh()
    } catch (err) {
      setError('Failed to cancel the scheduled post. Please try again.')
    } finally {
      setIsLoading(null)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 text-gray-400 animate-spin">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
        <h3 className="mt-2 text-lg font-medium text-gray-900">Loading scheduled posts...</h3>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 text-red-400">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="mt-2 text-lg font-medium text-red-900">Error loading posts</h3>
        <p className="mt-1 text-sm text-red-600">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No scheduled posts found</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden">
      <ul role="list" className="divide-y divide-gray-200">
        {posts.map((post) => (
          <li key={post.id} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {post.contentDraft.Idea.title}
                  </h3>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${post.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                        post.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                      }`}
                  >
                    {post.status}
                  </span>
                </div>
                <div className="mt-1">
                  <p className="text-sm text-gray-500">
                    Created by {post.contentDraft.User.name || post.contentDraft.User.email}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <p className="text-sm text-gray-500">
                  Scheduled for {format(new Date(post.scheduledDate), 'PPP p')}
                </p>
                <p className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(post.scheduledDate), { addSuffix: true })}
                </p>
                {post.status === 'SCHEDULED' && (
                  <button
                    type="button"
                    onClick={() => handleCancelSchedule(post.id)}
                    disabled={isLoading === post.id}
                    className="text-sm text-red-600 hover:text-red-500 disabled:opacity-50"
                  >
                    {isLoading === post.id ? 'Canceling...' : 'Cancel Schedule'}
                  </button>
                )}
              </div>
            </div>
            {error && (
              <div className="mt-2 text-sm text-red-600">
                {error}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
} 