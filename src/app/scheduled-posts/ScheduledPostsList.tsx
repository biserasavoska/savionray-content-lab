'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow, format } from 'date-fns'

interface Creator {
  name: string | null
  email: string | null
}

interface ContentDraft {
  id: string
  body: string
  createdBy: Creator
  idea: {
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

interface ScheduledPostsListProps {
  posts: ScheduledPost[]
}

export default function ScheduledPostsList({ posts }: ScheduledPostsListProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

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
                    {post.contentDraft.idea.title}
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
                    Created by {post.contentDraft.createdBy.name || post.contentDraft.createdBy.email}
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