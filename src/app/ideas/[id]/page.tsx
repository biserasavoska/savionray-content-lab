'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { ArrowLeftIcon, PencilIcon, TrashIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import FeedbackForm from '@/components/feedback/FeedbackForm'
import FeedbackList from '@/components/feedback/FeedbackList'
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
  User: {
    id: string
    name: string
    email: string
  }
  feedback?: Array<{
    id: string
    comment: string
    rating: number
    category: string
    priority: string
    actionable: boolean
    createdAt: string
    User: {
      name: string
      email: string
    }
  }>
}

export default function IdeaDetailPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const { currentOrganization } = useOrganization()
  const [idea, setIdea] = useState<Idea | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)
  const [feedback, setFeedback] = useState<Array<{
    id: string
    comment: string
    rating: number
    category: string
    priority: string
    actionable: boolean
    createdAt: string
    User: {
      name: string
      email: string
    }
  }>>([])
  const [loadingFeedback, setLoadingFeedback] = useState(false)

  useEffect(() => {
    if (params.id && currentOrganization?.id) {
      fetchIdea(params.id as string)
      fetchFeedback(params.id as string)
    }
  }, [params.id, currentOrganization?.id])

  const fetchIdea = async (id: string) => {
    try {
      setLoading(true)
      
      if (!currentOrganization?.id) {
        setError('No organization context available')
        setLoading(false)
        return
      }

      const response = await fetch(`/api/ideas/${id}`, {
        headers: {
          'x-selected-organization': currentOrganization.id,
        },
      })
      
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

  const fetchFeedback = async (ideaId: string) => {
    try {
      setLoadingFeedback(true)
      const response = await fetch(`/api/feedback?ideaId=${ideaId}`)
      
      if (!response.ok) {
        console.error('Failed to fetch feedback')
        return
      }

      const data = await response.json()
      setFeedback(data)
    } catch (error) {
      console.error('Error fetching feedback:', error)
    } finally {
      setLoadingFeedback(false)
    }
  }

  const handleFeedbackSuccess = () => {
    if (idea) {
      fetchFeedback(idea.id)
    }
    setShowFeedbackForm(false)
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!idea || !currentOrganization?.id) return

    setIsUpdating(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const response = await fetch(`/api/ideas/${idea.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-selected-organization': currentOrganization.id,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      const updatedIdea = await response.json()
      setIdea(updatedIdea)
      
      // Show success message
      if (newStatus === 'APPROVED') {
        setSuccessMessage('Idea approved! A content draft has been created and is now available in Content Status.')
      } else if (newStatus === 'REJECTED') {
        setSuccessMessage('Idea rejected.')
      }
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000)
    } catch (error) {
      console.error('Error updating status:', error)
      setError('Failed to update status')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!idea || !currentOrganization?.id || !confirm('Are you sure you want to delete this idea?')) return

    try {
      const response = await fetch(`/api/ideas/${idea.id}`, {
        method: 'DELETE',
        headers: {
          'x-selected-organization': currentOrganization.id,
        },
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

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
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
            <div 
              className="text-gray-700 whitespace-pre-wrap prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: idea.description }}
            />
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
                  disabled={isUpdating}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Approving...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                      Approve Idea
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleStatusChange('REJECTED')}
                  disabled={isUpdating}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <XCircleIcon className="h-4 w-4 mr-2" />
                      Reject Idea
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Feedback Section */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Feedback</h3>
              <button
                onClick={() => setShowFeedbackForm(!showFeedbackForm)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {showFeedbackForm ? 'Hide Feedback Form' : 'Give Feedback'}
              </button>
            </div>

            {/* Feedback Form */}
            {showFeedbackForm && (
              <div className="mb-6">
                <div className="bg-gray-50 p-4 rounded-md">
                  <FeedbackForm
                    ideaId={idea.id}
                    onSuccess={handleFeedbackSuccess}
                  />
                </div>
              </div>
            )}

            {/* Feedback History */}
            {loadingFeedback ? (
              <div className="text-center py-4">
                <p className="text-gray-500">Loading feedback...</p>
              </div>
            ) : feedback.length > 0 ? (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Previous Feedback ({feedback.length})</h4>
                <FeedbackList feedbacks={feedback} />
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500">No feedback yet.</p>
              </div>
            )}
          </div>

          {idea.status === 'APPROVED' && (
            <div className="border-t pt-6">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Idea Approved!</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>A content draft has been automatically created and is now available in <strong>Content Status → Drafts</strong>.</p>
                      <p className="mt-1">The creative team will now work on creating content based on this approved idea.</p>
                    </div>
                    <div className="mt-3">
                      <Link
                        href="/ready-content"
                        className="inline-flex items-center px-3 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        View Content Drafts
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
