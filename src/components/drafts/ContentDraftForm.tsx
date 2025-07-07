'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import type { ContentDraft, Idea } from '@/types/content'
import RichTextEditor from '../editor/RichTextEditor'
import { debounce } from 'lodash'
import FormField, { Select } from '@/components/ui/forms/FormField'
import Button from '@/components/ui/common/Button'
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/layout/Card'
import Badge from '@/components/ui/common/Badge'

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
          <CardTitle>{draft ? 'Edit Draft' : 'Create New Draft'}</CardTitle>
          {getSaveStatusBadge()}
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}

          <FormField label="Content Type">
            <Select
              options={contentTypeOptions}
              value={contentType}
              onChange={(e) => setContentType(e.target.value as ContentType)}
            />
          </FormField>

          <FormField label="Content">
            <RichTextEditor
              content={formData.body}
              onChange={(content) => setFormData((prev) => ({ ...prev, body: content }))}
              maxLength={CHARACTER_LIMITS[contentType]}
              placeholder="Write your content here..."
            />
          </FormField>
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
              disabled={isSubmitting || saveStatus === 'saving'}
            >
              {isSubmitting ? 'Saving...' : draft ? 'Update Draft' : 'Create Draft'}
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
} 