'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ContentDraft, Idea } from '@prisma/client'
import RichTextEditor from '../editor/RichTextEditor'
import { debounce } from 'lodash'

type ContentType = 'social-media' | 'blog' | 'newsletter'

interface ContentDraftFormProps {
  idea: Idea
  draft?: ContentDraft
  onSuccess?: () => void
}

const CHARACTER_LIMITS: Record<ContentType, number | undefined> = {
  'social-media': 280,
  'blog': undefined,
  'newsletter': undefined,
}

const AUTO_SAVE_DELAY = 2000 // 2 seconds

export default function ContentDraftForm({ idea, draft, onSuccess }: ContentDraftFormProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved')
  const [contentType, setContentType] = useState<ContentType>(
    draft?.metadata ? (draft.metadata as any).contentType : 'social-media'
  )
  const [formData, setFormData] = useState({
    body: draft?.body || '',
  })
  const [draftId, setDraftId] = useState<string | undefined>(draft?.id)

  // Auto-save function
  const autoSave = useCallback(
    debounce(async (data: typeof formData, type: ContentType, id?: string) => {
      if (!session?.user?.id) return

      setSaveStatus('saving')
      try {
        const response = await fetch(id ? `/api/drafts/${id}` : '/api/drafts', {
          method: id ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...data,
            ideaId: idea.id,
            contentType: type,
            status: 'PENDING_FEEDBACK', // Use existing status
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to auto-save')
        }

        const savedDraft = await response.json()
        if (!id) {
          setDraftId(savedDraft.id)
        }
        setSaveStatus('saved')
      } catch (error) {
        console.error('Auto-save failed:', error)
        setSaveStatus('error')
      }
    }, AUTO_SAVE_DELAY),
    [session?.user?.id, idea.id]
  )

  // Trigger auto-save when content changes
  useEffect(() => {
    if (formData.body) {
      autoSave(formData, contentType, draftId)
    }
    return () => {
      autoSave.cancel()
    }
  }, [formData, contentType, draftId, autoSave])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.id) return

    setIsSubmitting(true)
    setError('')

    try {
      // Wait for any pending auto-saves to complete
      await autoSave.flush()

      const response = await fetch(draftId ? `/api/drafts/${draftId}/submit` : '/api/drafts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          ideaId: idea.id,
          contentType,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save draft')
      }

      onSuccess?.()
      router.push(`/ideas/${idea.id}/drafts`)
    } catch (error) {
      console.error('Failed to save draft:', error)
      setError('Failed to save draft. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">
            Content Type
          </label>
          <div className="mt-1">
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value as ContentType)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
            >
              <option value="social-media">Social Media Post</option>
              <option value="blog">Blog Article</option>
              <option value="newsletter">Newsletter</option>
            </select>
          </div>
        </div>
        <div className="ml-4 flex items-center">
          {saveStatus === 'saving' && (
            <span className="text-sm text-gray-500">Saving...</span>
          )}
          {saveStatus === 'saved' && (
            <span className="text-sm text-green-600">All changes saved</span>
          )}
          {saveStatus === 'error' && (
            <span className="text-sm text-red-600">Failed to save changes</span>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Content
        </label>
        <div className="mt-1">
          <RichTextEditor
            content={formData.body}
            onChange={(content) => setFormData((prev) => ({ ...prev, body: content }))}
            maxLength={CHARACTER_LIMITS[contentType]}
            placeholder="Write your content here..."
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.push(`/ideas/${idea.id}/drafts`)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || saveStatus === 'saving'}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : draft ? 'Update Draft' : 'Create Draft'}
        </button>
      </div>
    </form>
  )
} 