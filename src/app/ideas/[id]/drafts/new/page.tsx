'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Idea } from '@prisma/client'
import ContentDraftForm from '@/components/drafts/ContentDraftForm'

export default function NewDraftPage() {
  const params = useParams()
  const [idea, setIdea] = useState<Idea | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchIdea = async () => {
      try {
        const response = await fetch(`/api/ideas/${params.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch idea')
        }
        const data = await response.json()
        setIdea(data)
      } catch (error) {
        console.error('Error fetching idea:', error)
        setError('Failed to load idea. Please try again.')
      }
    }

    if (params.id) {
      fetchIdea()
    }
  }, [params.id])

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!idea) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Create New Draft</h1>
          <p className="mt-2 text-sm text-gray-600">
            Creating content for idea: {idea.title}
          </p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <ContentDraftForm idea={idea} />
        </div>
      </div>
    </div>
  )
} 