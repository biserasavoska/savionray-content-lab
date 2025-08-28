'use client'

import Link from 'next/link'

import type { ContentDraft, Idea, User } from '../../types/content'
import { formatDate } from '../../lib/utils/date-helpers'
import StatusBadge from '@/components/ui/common/StatusBadge'
import Button from '@/components/ui/common/Button'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/common/Card'

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
        <Card key={content.id} className="overflow-hidden">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-medium text-gray-900">
                {content.Idea.title}
              </h3>
              <StatusBadge 
                status="PUBLISHED" 
                variant="rounded"
                size="sm"
              />
            </div>
          </CardHeader>
          
          <CardContent>
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
                      <StatusBadge 
                        status={post.status}
                        variant="rounded"
                        size="sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter>
            <div className="flex flex-col space-y-2 ml-auto">
              <Link href={`/published/${content.id}`}>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </Link>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
} 