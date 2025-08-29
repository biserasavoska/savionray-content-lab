'use client'

import { useSession } from 'next-auth/react'

import { Textarea } from '@/components/ui/common/FormField'
import Button from '@/components/ui/common/Button'
import { useFormData } from '@/components/ui/common/hooks'

interface FeedbackFormProps {
  draftId: string
  onSuccess?: () => void
}

export default function FeedbackForm({ draftId, onSuccess }: FeedbackFormProps) {
  const { data: session } = useSession()

  // Use the new form hook
  const { formData, updateFormData, errors, loading, handleSubmit } = useFormData({
    initialData: {
      comment: '',
    },
    onValidate: (data) => {
      const validationErrors: Record<string, string> = {}
      
      if (!data.comment.trim()) {
        validationErrors.comment = 'Feedback comment is required'
      }
      
      return Object.keys(validationErrors).length > 0 ? validationErrors : null
    },
    onSubmit: async (data) => {
      if (!session?.user?.id) return

      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentDraftId: draftId,
          comment: data.comment.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit feedback')
      }

      onSuccess?.()
    }
  })

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField 
        label="Add Feedback"
        error={errors.comment}
      >
        <Textarea
          value={formData.comment}
          onChange={(e) => updateFormData('comment', e.target.value)}
          rows={4}
          placeholder="Enter your feedback here..."
          disabled={loading}
        />
      </FormField>

      <div className="flex justify-end">
        <Button
          type="submit"
          loading={loading}
          disabled={!formData.comment.trim()}
        >
          Submit Feedback
        </Button>
      </div>
    </form>
  )
} 