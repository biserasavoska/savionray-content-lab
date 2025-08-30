'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { debounce } from 'lodash'

import RichTextEditor from '../editor/RichTextEditor'

import type { ContentDraft, Idea } from '@/types/content'
import { Select } from '@/components/ui/common/FormField'
import Button from '@/components/ui/common/Button'
import Card, { CardHeader, CardContent, CardFooter } from '@/components/ui/common/Card'
import Badge from '@/components/ui/common/Badge'
import { useFormData } from '@/components/ui/common/hooks'

type ContentType = 'social-media' | 'blog' | 'newsletter'

interface ContentDraftFormProps {
  idea: {
    id: string
    title: string
    description: string
    status: string
    publishingDateTime: Date | null
    savedForLater: boolean
    mediaType: string | null
    createdAt: Date
    updatedAt: Date
    createdById: string
    contentType: string | null
    deliveryItemId?: string | null
  }
  draft?: ContentDraft
  onSuccess?: () => void
}

const CHARACTER_LIMITS: Record<ContentType, number | undefined> = {
  'social-media': 280,
  'blog': undefined,
  'newsletter': undefined,
}

const AUTO_SAVE_DELAY = 2000 // 2 seconds

const contentTypeOptions = [
  { value: 'social-media', label: 'Social Media Post' },
  { value: 'blog', label: 'Blog Article' },
  { value: 'newsletter', label: 'Newsletter' },
]

export default function ContentDraftForm({ idea, draft, onSuccess }: ContentDraftFormProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved')
  const [draftId, setDraftId] = useState<string | undefined>(draft?.id)

  // Use the new form hook
  const { formData, updateFormData, errors, loading, handleSubmit } = useFormData({
    initialData: {
      contentType: draft?.metadata ? (draft.metadata as any).contentType : 'social-media',
      body: draft?.body || '',
    },
    onValidate: (data) => {
      const validationErrors: Record<string, string> = {}
      
      if (!data.body.trim()) {
        validationErrors.body = 'Content is required'
      }
      
      if (!data.contentType) {
        validationErrors.contentType = 'Content type is required'
      }
      
      return Object.keys(validationErrors).length > 0 ? validationErrors : null
    },
    onSubmit: async (data) => {
      if (!session?.user?.id) return

      // Wait for any pending auto-saves to complete
      await autoSave.flush()

      const response = await fetch(draftId ? `/api/drafts/${draftId}/submit` : '/api/drafts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          ideaId: idea.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save draft')
      }

      onSuccess?.()
      router.push(`/ideas/${idea.id}/drafts`)
    }
  })

  // Auto-save function
  const autoSave = useCallback(
    debounce(async (data: typeof formData, id?: string) => {
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
      autoSave(formData, draftId)
    }
    return () => {
      autoSave.cancel()
    }
  }, [formData, draftId, autoSave])

  const getSaveStatusBadge = () => {
    switch (saveStatus) {
      case 'saving':
        return <Badge variant="warning">Saving...</Badge>
      case 'saved':
        return <Badge variant="success">All changes saved</Badge>
      case 'error':
        return <Badge variant="error">Failed to save changes</Badge>
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">{draft ? 'Edit Draft' : 'Create New Draft'}</h2>
          {getSaveStatusBadge()}
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {errors.submit && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{errors.submit}</h3>
                </div>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="contentType" className="block text-sm font-medium text-gray-700 mb-2">
              Content Type
            </label>
            <Select
              id="contentType"
              options={contentTypeOptions}
              value={formData.contentType}
              onChange={(value) => updateFormData('contentType', value as ContentType)}
            />
            {errors.contentType && (
              <p className="mt-1 text-sm text-red-600">{errors.contentType}</p>
            )}
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <RichTextEditor
              content={formData.body}
              onContentChange={(content) => updateFormData('body', content)}
              placeholder="Write your content here..."
            />
            {errors.body && (
              <p className="mt-1 text-sm text-red-600">{errors.body}</p>
            )}
          </div>
        </CardContent>

        <CardFooter>
          <div className="flex justify-end space-x-3 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/ideas/${idea.id}/drafts`)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading || saveStatus === 'saving'}
            >
              {draft ? 'Update Draft' : 'Create Draft'}
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
} 