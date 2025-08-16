'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/common/Card'
import Badge from '@/components/ui/common/Badge'
import Button from '@/components/ui/common/Button'
import { PlusIcon, EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

interface Idea {
  id: string
  title: string
  description: string
  status: string
  contentType: string
  mediaType: string
  createdAt: string
  createdBy: {
    name: string
    email: string
  }
  publishingDateTime?: string
  savedForLater: boolean
}

export default function IdeasList() {
  const { data: session } = useSession()
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchIdeas()
  }, [])

  const fetchIdeas = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/ideas')
      if (!response.ok) {
        throw new Error('Failed to fetch ideas')
      }
      const data = await response.json()
      setIdeas(data.ideas || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch ideas')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'success'
      case 'pending':
        return 'warning'
      case 'rejected':
        return 'danger'
      case 'draft':
        return 'info'
      default:
        return 'default'
    }
  }

  const getContentTypeColor = (contentType: string) => {
    switch (contentType?.toLowerCase()) {
      case 'social-media':
        return 'bg-blue-100 text-blue-800'
      case 'blog':
        return 'bg-green-100 text-green-800'
      case 'email':
        return 'bg-purple-100 text-purple-800'
      case 'video':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchIdeas}>Try Again</Button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {ideas.length} {ideas.length === 1 ? 'Idea' : 'Ideas'}
          </h2>
          <Badge variant="info">{ideas.filter(i => i.status === 'APPROVED').length} Approved</Badge>
          <Badge variant="warning">{ideas.filter(i => i.status === 'PENDING').length} Pending</Badge>
        </div>
        
        <Link href="/ideas/new">
          <Button className="flex items-center space-x-2">
            <PlusIcon className="h-4 w-4" />
            <span>New Idea</span>
          </Button>
        </Link>
      </div>

      {ideas.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No ideas yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first content idea.
          </p>
          <div className="mt-6">
            <Link href="/ideas/new">
              <Button>Create Idea</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ideas.map((idea) => (
            <Card key={idea.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {idea.title}
                  </CardTitle>
                  <Badge variant={getStatusBadgeVariant(idea.status)}>
                    {idea.status}
                  </Badge>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getContentTypeColor(idea.contentType)}`}>
                    {idea.contentType || 'Unknown'}
                  </span>
                  {idea.mediaType && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                      {idea.mediaType}
                    </span>
                  )}
                  {idea.savedForLater && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                      Saved
                    </span>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                  {idea.description}
                </p>
                
                <div className="space-y-2 text-xs text-gray-500 mb-4">
                  <div className="flex justify-between">
                    <span>Created by:</span>
                    <span className="font-medium">{idea.createdBy.name || idea.createdBy.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Created:</span>
                    <span>{new Date(idea.createdAt).toLocaleDateString('en-US')}</span>
                  </div>
                  {idea.publishingDateTime && (
                    <div className="flex justify-between">
                      <span>Publish:</span>
                      <span>{new Date(idea.publishingDateTime).toLocaleDateString('en-US')}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <Link href={`/ideas/${idea.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      <EyeIcon className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </Link>
                  
                  <Link href={`/ideas/${idea.id}/edit`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      <PencilIcon className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  
                  {idea.status === 'APPROVED' && (
                    <Link href={`/ideas/${idea.id}/drafts/new`} className="flex-1">
                      <Button className="w-full">
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Create Draft
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

