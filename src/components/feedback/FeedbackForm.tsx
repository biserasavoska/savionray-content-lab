'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'

interface FeedbackFormProps {
  draftId: string
  onSuccess?: () => void
}

export default function FeedbackForm({ draftId, onSuccess }: FeedbackFormProps) {
  const { data: session } = useSession()
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.id) return
    if (!comment.trim()) return

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentDraftId: draftId,
          comment: comment.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit feedback')
      }

      setComment('')
      onSuccess?.()
    } catch (error) {
      console.error('Failed to submit feedback:', error)
      setError('Failed to submit feedback. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
          Add Feedback
        </label>
        <div className="mt-1">
          <textarea
            id="comment"
            name="comment"
            rows={4}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
            placeholder="Enter your feedback here..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || !comment.trim()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </div>
    </form>
  )
} 