'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ContentDraft, Idea, User } from '@prisma/client'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface DraftWithUser extends ContentDraft {
  createdBy: Pick<User, 'name' | 'email'>
}

interface IdeaWithDrafts extends Idea {
  contentDrafts: DraftWithUser[]
}

export default function DraftHistory({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [idea, setIdea] = useState<IdeaWithDrafts | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchIdeaWithDrafts()
  }, [params.id])

  const fetchIdeaWithDrafts = async () => {
    try {
      const response = await fetch(`/api/ideas/${params.id}?include=drafts`)
      if (!response.ok) throw new Error('Failed to fetch idea')
      const data = await response.json()
      setIdea(data)
    } catch (error) {
      setError('Error loading idea and drafts')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return <div>Please sign in to access this page.</div>
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div className="text-red-600">{error}</div>
  }

  if (!idea) {
    return <div>Idea not found</div>
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{idea.title}</h1>
            <p className="mt-1 text-sm text-gray-600">{idea.description}</p>
          </div>
          <Link
            href={`/create-content/${idea.id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
          >
            Create New Draft
          </Link>
        </div>

        <div className="space-y-8">
          {idea.contentDrafts.map((draft, index) => (
            <div key={draft.id} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${draft.status === 'PENDING_FIRST_REVIEW' ? 'bg-yellow-100 text-yellow-800' :
                        draft.status === 'NEEDS_REVISION' ? 'bg-red-100 text-red-800' :
                        draft.status === 'PENDING_FINAL_APPROVAL' ? 'bg-blue-100 text-blue-800' :
                        draft.status === 'APPROVED_FOR_PUBLISHING' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'}`}
                    >
                      {draft.status.replace(/_/g, ' ')}
                    </span>
                    <span className="text-sm text-gray-500">
                      Version {idea.contentDrafts.length - index}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(draft.createdAt), { addSuffix: true })}
                  </div>
                </div>

                <div className="prose max-w-none">
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700">Content</h3>
                    <p className="mt-1 text-gray-900 whitespace-pre-wrap">{draft.body}</p>
                  </div>

                  {draft.metadata && (
                    <>
                      <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-700">Hashtags</h3>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {draft.metadata.hashtags?.map((tag: string, i: number) => (
                            <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-700">Call to Action</h3>
                        <p className="mt-1 text-gray-900">{draft.metadata.callToAction}</p>
                      </div>

                      <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-700">Additional Context</h3>
                        <p className="mt-1 text-gray-900">{draft.metadata.additionalContext || 'None'}</p>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      By {draft.createdBy.name || draft.createdBy.email}
                    </span>
                    <span className="text-sm text-gray-500">
                      • Model: {draft.metadata?.model || 'Unknown'}
                    </span>
                  </div>
                  
                  <div className="flex space-x-4">
                    <Link
                      href={`/create-content/${idea.id}/drafts/${draft.id}/edit`}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Edit
                    </Link>
                    {index > 0 && (
                      <button
                        onClick={() => {}}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Compare with Previous
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {idea.contentDrafts.length === 0 && (
            <div className="text-center py-12 bg-white shadow rounded-lg">
              <p className="text-gray-500">No drafts created yet.</p>
              <Link
                href={`/create-content/${idea.id}/edit`}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
              >
                Create First Draft
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 