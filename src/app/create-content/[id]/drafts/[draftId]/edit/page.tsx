'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Idea } from '@prisma/client'
import ModelSelector from '@/components/ModelSelector'
import { AVAILABLE_MODELS } from '@/lib/models'

// Define a local ContentDraft type for frontend use
interface LocalContentDraft {
  id: string
  body: string
  status: string
  createdAt: string | Date
  updatedAt: string | Date
  createdById: string
  ideaId: string
  metadata: any
}

interface DraftMetadata {
  model: string
  additionalContext?: string
  conversation: { role: 'user' | 'assistant'; content: string }[]
  hashtags: string[]
  callToAction: string
}

interface DraftWithMetadata extends LocalContentDraft {
  metadata: DraftMetadata
}

export default function EditDraft({ params }: { params: { id: string; draftId: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [draft, setDraft] = useState<DraftWithMetadata | null>(null)
  const [idea, setIdea] = useState<Idea | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0])
  const [postText, setPostText] = useState('')
  const [hashtags, setHashtags] = useState<string[]>([])
  const [callToAction, setCallToAction] = useState('')
  const [additionalContext, setAdditionalContext] = useState('')

  useEffect(() => {
    fetchDraftAndIdea()
  }, [params.id, params.draftId])

  const fetchDraftAndIdea = async () => {
    try {
      // Fetch draft
      const draftResponse = await fetch(`/api/content-drafts/${params.draftId}`)
      if (!draftResponse.ok) throw new Error('Failed to fetch draft')
      const draftData = await draftResponse.json()
      setDraft(draftData)
      
      // Set form data from draft
      setPostText(draftData.body)
      setHashtags(draftData.metadata.hashtags || [])
      setCallToAction(draftData.metadata.callToAction || '')
      setAdditionalContext(draftData.metadata.additionalContext || '')
      setSelectedModel(AVAILABLE_MODELS.find(m => m.id === draftData.metadata.model) || AVAILABLE_MODELS[0])

      // Fetch idea
      const ideaResponse = await fetch(`/api/ideas/${params.id}`)
      if (!ideaResponse.ok) throw new Error('Failed to fetch idea')
      const ideaData = await ideaResponse.json()
      setIdea(ideaData)
    } catch (error) {
      setError('Error loading draft')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveDraft = async (status: 'DRAFT' | 'AWAITING_REVISION' | 'AWAITING_FEEDBACK' | 'APPROVED' | 'REJECTED' | 'PUBLISHED') => {
    setSaving(true)
    try {
      const response = await fetch(`/api/content-drafts/${params.draftId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          contentType: 'SOCIAL_MEDIA_POST',
          body: postText,
          metadata: {
            model: selectedModel.id,
            additionalContext,
            conversation: draft?.metadata.conversation || [],
            hashtags,
            callToAction
          }
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error)
      }

      // Redirect back to drafts page
      router.push(`/create-content/${params.id}/drafts`)
    } catch (error) {
      console.error('Error saving draft:', error)
      setError(error instanceof Error ? error.message : 'Failed to save draft')
    } finally {
      setSaving(false)
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

  if (!draft || !idea) {
    return <div>Draft not found</div>
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Edit Draft</h1>
          <p className="mt-1 text-sm text-gray-600">
            Editing draft for: {idea.title}
          </p>
        </div>

        <div className="mb-6">
          <ModelSelector
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            models={AVAILABLE_MODELS}
          />
        </div>

        <div className="mb-6">
          <label htmlFor="postText" className="block text-sm font-medium text-gray-700">
            Post Text
          </label>
          <div className="mt-1">
            <textarea
              id="postText"
              name="postText"
              rows={5}
              className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
            />
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="hashtags" className="block text-sm font-medium text-gray-700">
            Hashtags
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="hashtags"
              name="hashtags"
              className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
              value={hashtags.join(' ')}
              onChange={(e) => setHashtags(e.target.value.split(/\s+/).filter(Boolean))}
              placeholder="Enter hashtags separated by spaces"
            />
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="callToAction" className="block text-sm font-medium text-gray-700">
            Call to Action
          </label>
          <div className="mt-1">
            <textarea
              id="callToAction"
              name="callToAction"
              rows={2}
              className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
              value={callToAction}
              onChange={(e) => setCallToAction(e.target.value)}
            />
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="additionalContext" className="block text-sm font-medium text-gray-700">
            Additional Context
          </label>
          <div className="mt-1">
            <textarea
              id="additionalContext"
              name="additionalContext"
              rows={3}
              className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              placeholder="Add any additional context or specific requirements..."
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <button
            onClick={() => router.push(`/create-content/${params.id}/drafts`)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Cancel
          </button>
          <button
            onClick={() => saveDraft('DRAFT')}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            {saving ? 'Saving...' : 'Save as Draft'}
          </button>
          <button
            onClick={() => saveDraft('AWAITING_FEEDBACK')}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            {saving ? 'Saving...' : 'Submit for Approval'}
          </button>
        </div>
      </div>
    </div>
  )
} 