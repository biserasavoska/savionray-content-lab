'use client'

import { FormField, Textarea } from '@/components/ui/common/FormField'
import Button from '@/components/ui/common/Button'
import { useFormData } from '@/components/ui/common/hooks'

interface FeedbackFormProps {
  ideaId: string
  onSubmit: (ideaId: string, feedback: any) => void
}

export default function FeedbackForm({ ideaId, onSubmit }: FeedbackFormProps) {
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
      
      if (data.comment.length < 10) {
        validationErrors.comment = 'Feedback must be at least 10 characters long'
      }
      
      if (data.comment.length > 1000) {
        validationErrors.comment = 'Feedback must be less than 1000 characters'
      }
      
      return Object.keys(validationErrors).length > 0 ? validationErrors : null
    },
    onSubmit: async (data) => {
      const response = await fetch(`/api/ideas/${ideaId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment: data.comment }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit feedback')
      }

      const feedback = await response.json()
      onSubmit(ideaId, feedback)
    }
  })

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField 
        label="Feedback"
        error={errors.comment}
      >
        <Textarea
          value={formData.comment}
          onChange={(e) => updateFormData('comment', e.target.value)}
          rows={3}
          placeholder="Provide your feedback..."
          required
          minLength={10}
          maxLength={1000}
          disabled={loading}
        />
      </FormField>

      <div className="flex justify-end">
        <Button
          type="submit"
          loading={loading}
        >
          Submit Feedback
        </Button>
      </div>
    </form>
  )
} 