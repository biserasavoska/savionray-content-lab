'use client'

import Link from 'next/link'

import type { ContentDraft, Idea, User } from '../../types/content'
import { formatDate } from '../../lib/utils/date-helpers'

// Local ScheduledPost type
interface ScheduledPost {
  id: string
  scheduledDate: Date
  status: string
}

interface PublishedContentListProps {
  publishedContent: (ContentDraft & {
    Idea: Idea & {
      User: Pick<User, 'name' | 'email'>
    }
    User: Pick<User, 'name' | 'email'>
    scheduledPosts: ScheduledPost[]
  })[]
  isCreativeUser: boolean
}

export default function PublishedContentList({ publishedContent, isCreativeUser }: PublishedContentListProps) {
  if (publishedContent.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No published content</h3>
        <p className="text-gray-600">There is no published content yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {publishedContent.map((content) => (
        <div key={content.id} className="bg-white shadow rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-medium text-gray-900">
                  {content.Idea.title}
                </h3>
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  PUBLISHED
                </span>
              </div>
              
              <p className="text-gray-600 mb-4">{content.Idea.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500 mb-4">
                <div>
                  <span className="font-medium">Created by:</span> {content.User.name || content.User.email}
                </div>
                <div>
                  <span className="font-medium">Content Type:</span> {content.contentType}
                </div>
                <div>
                  <span className="font-medium">Published:</span> {formatDate(content.updatedAt)}
                </div>
              </div>

              {/* Scheduled Posts */}
              {content.scheduledPosts.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Scheduled Posts:</h4>
                  <div className="space-y-2">
                    {content.scheduledPosts.map((post) => (
                      <div key={post.id} className="flex items-center space-x-2 text-sm">
                        <span className="text-gray-500">
                          {formatDate(post.scheduledDate)} at{' '}
                          {new Date(post.scheduledDate).toLocaleTimeString()}
                        </span>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          post.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                          post.status === 'SCHEDULED' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {post.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col space-y-2 ml-4">
              <Link
                href={`/published/${content.id}`}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                View Details
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 