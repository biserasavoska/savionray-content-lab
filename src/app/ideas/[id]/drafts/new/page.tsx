'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function CreateDraftPage() {
  const params = useParams()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const createDraftAndRedirect = async () => {
      if (!params.id) return

      try {
        // Create a new draft for this idea
        const response = await fetch('/api/drafts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ideaId: params.id,
            body: '', // Empty body to be filled
            contentType: 'SOCIAL_MEDIA_POST', // Default content type
            metadata: {}
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to create draft')
        }

        const newDraft = await response.json()
        
        // Navigate to edit the newly created draft
        router.replace(`/ready-content/${newDraft.id}/edit`)
      } catch (error) {
        console.error('Error creating draft:', error)
        setError('Failed to create draft. Please try again.')
      }
    }

    createDraftAndRedirect()
  }, [params.id, router])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push(`/ideas/${params.id}`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Idea
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Creating draft and redirecting...</p>
      </div>
    </div>
  )
}