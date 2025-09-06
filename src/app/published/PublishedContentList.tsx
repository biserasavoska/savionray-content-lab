'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

import type { ContentDraft, Idea, User } from '../../types/content'
import { formatDate } from '../../lib/utils/date-helpers'
import StatusBadge from '@/components/ui/common/StatusBadge'
import Button from '@/components/ui/common/Button'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/common/Card'
import { useOrganization } from '@/lib/contexts/OrganizationContext'

// Local ScheduledPost type
interface ScheduledPost {
  id: string
  scheduledDate: Date
  status: string
}

interface PublishedContentListProps {
  isCreativeUser: boolean
}

export default function PublishedContentList({ isCreativeUser }: PublishedContentListProps) {
  const { currentOrganization } = useOrganization()
  const [publishedContent, setPublishedContent] = useState<(ContentDraft & {
    Idea: Idea & {
      User: Pick<User, 'name' | 'email'>
    }
    User: Pick<User, 'name' | 'email'>
    scheduledPosts: ScheduledPost[]
  })[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch published content data
  useEffect(() => {
    const fetchContent = async () => {
      if (!currentOrganization) {
        console.log('No current organization, skipping fetch')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        console.log('Fetching published content for organization:', currentOrganization.id)
        
        const response = await fetch('/api/published', {
          headers: {
            'x-selected-organization': currentOrganization.id
          }
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('API error:', response.status, errorText)
          throw new Error(`Failed to fetch published content: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('Published content data:', data)
        setPublishedContent(data.content || [])
      } catch (err) {
        console.error('Error fetching published content:', err)
        setError('Failed to load published content')
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [currentOrganization])

  // Loading state
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 text-gray-400 animate-spin">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
        <h3 className="mt-2 text-lg font-medium text-gray-900">Loading published content...</h3>
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
        <h3 className="mt-2 text-lg font-medium text-red-900">Error loading content</h3>
        <p className="mt-1 text-sm text-red-600">{error}</p>
        <p className="mt-1 text-xs text-gray-500">
          Current organization: {currentOrganization?.name || 'None selected'}
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (!publishedContent || publishedContent.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No published content</h3>
        <p className="text-gray-600">There is no published content yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {publishedContent?.map((content) => (
        <Card key={content.id} className="overflow-hidden">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-medium text-gray-900">
                {content.Idea.title}
              </h3>
              <StatusBadge 
                status="published" 
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
            {(content.scheduledPosts?.length || 0) > 0 && (
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
                        status={post.status as any}
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