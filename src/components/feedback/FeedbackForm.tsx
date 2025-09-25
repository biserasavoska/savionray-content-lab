'use client'

import { useRef } from 'react'
import { useSession } from 'next-auth/react'

import { Textarea } from '@/components/ui/common/FormField'
import Button from '@/components/ui/common/Button'
import { useFormData } from '@/components/ui/common/hooks'

interface FeedbackFormProps {
  draftId?: string
  ideaId?: string
  onSuccess?: () => void
}

export default function FeedbackForm({ draftId, ideaId, onSuccess }: FeedbackFormProps) {
  const { data: session } = useSession()
  const commentTextareaRef = useRef<HTMLTextAreaElement>(null)

  // Use the new form hook
  const { formData, updateFormData, errors, loading, handleSubmit } = useFormData({
    initialData: {
      comment: '',
      rating: 0,
      category: 'general',
      priority: 'medium',
      actionable: false,
    },
    onValidate: (data) => {
      const validationErrors: Record<string, string> = {}
      
      if (!data.comment.trim()) {
        validationErrors.comment = 'Feedback comment is required'
      }
      
      // Rating is optional - only validate if provided
      if (data.rating > 0 && (data.rating < 1 || data.rating > 5)) {
        validationErrors.rating = 'Rating must be between 1 and 5'
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
          contentDraftId: draftId || null,
          ideaId: ideaId || null,
          comment: data.comment.trim(),
          rating: data.rating,
          category: data.category,
          priority: data.priority,
          actionable: data.actionable,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit feedback')
      }

      onSuccess?.()
    }
  })

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // If comment is empty, focus the textarea to guide the user
    if (!formData.comment.trim()) {
      commentTextareaRef.current?.focus()
      return
    }
    
    // Otherwise, proceed with normal form submission
    handleSubmit(e)
  }

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      {/* Comment - Moved to top */}
      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
          Feedback Comment
        </label>
        <Textarea
          ref={commentTextareaRef}
          id="comment"
          value={formData.comment}
          onChange={(e) => updateFormData('comment', e.target.value)}
          rows={4}
          placeholder="Enter your detailed feedback here..."
          disabled={loading}
        />
        {errors.comment && (
          <p className="mt-1 text-sm text-red-600">{errors.comment}</p>
        )}
      </div>

      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rating (1-5 stars) <span className="text-gray-500 font-normal">- Optional</span>
        </label>
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => updateFormData('rating', star)}
                className={`text-2xl ${
                  star <= formData.rating
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                } hover:text-yellow-400 transition-colors`}
                disabled={loading}
              >
                ★
              </button>
            ))}
          </div>
          {formData.rating > 0 && (
            <button
              type="button"
              onClick={() => updateFormData('rating', 0)}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
              disabled={loading}
            >
              Clear rating
            </button>
          )}
        </div>
        {errors.rating && (
          <p className="mt-1 text-sm text-red-600">{errors.rating}</p>
        )}
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <select
          id="category"
          value={formData.category}
          onChange={(e) => updateFormData('category', e.target.value)}
          disabled={loading}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="general">General</option>
          <option value="content">Content</option>
          <option value="design">Design</option>
          <option value="technical">Technical</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Priority */}
      <div>
        <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
          Priority
        </label>
        <select
          id="priority"
          value={formData.priority}
          onChange={(e) => updateFormData('priority', e.target.value)}
          disabled={loading}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      {/* Actionable */}
      <div className="flex items-center">
        <input
          id="actionable"
          type="checkbox"
          checked={formData.actionable}
          onChange={(e) => updateFormData('actionable', e.target.checked)}
          disabled={loading}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="actionable" className="ml-2 block text-sm text-gray-700">
          This feedback requires action/follow-up
        </label>
      </div>

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