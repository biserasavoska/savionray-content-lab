'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { StarIcon } from '@heroicons/react/24/solid'
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline'

import { useCurrentOrganization } from '@/hooks/useCurrentOrganization'
import { FormField, Textarea, Select } from '@/components/ui/common/FormField'
import Button from '@/components/ui/common/Button'

interface FeedbackData {
  comment: string
  rating: number
  category: 'general' | 'content' | 'design' | 'technical' | 'strategy'
  priority: 'low' | 'medium' | 'high'
  actionable: boolean
}

interface EnhancedFeedbackFormProps {
  targetId: string
  targetType: 'idea' | 'content'
  onSuccess?: () => void
  onCancel?: () => void
}

const RATING_LABELS = {
  1: 'Poor',
  2: 'Fair', 
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent'
}

const CATEGORIES = [
  { value: 'general', label: 'General Feedback' },
  { value: 'content', label: 'Content & Messaging' },
  { value: 'design', label: 'Design & Visual' },
  { value: 'technical', label: 'Technical Issues' },
  { value: 'strategy', label: 'Strategy & Direction' }
]

const PRIORITIES = [
  { value: 'low', label: 'Low Priority' },
  { value: 'medium', label: 'Medium Priority' },
  { value: 'high', label: 'High Priority' }
]

export default function EnhancedFeedbackForm({ 
  targetId, 
  targetType, 
  onSuccess, 
  onCancel 
}: EnhancedFeedbackFormProps) {
  const { data: session } = useSession()
  const { organization } = useCurrentOrganization()
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackData>({
    comment: '',
    rating: 0,
    category: 'general',
    priority: 'medium',
    actionable: false
  })

  const handleRatingChange = (rating: number) => {
    setFeedback(prev => ({ ...prev, rating }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.id || !feedback.comment.trim()) return

    setLoading(true)
    try {
      const endpoint = targetType === 'idea' 
        ? `/api/ideas/${targetId}/feedback`
        : `/api/feedback`

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...feedback,
          ...(targetType === 'content' && { contentDraftId: targetId }),
          organizationId: organization?.id
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit feedback')
      }

      // Reset form
      setFeedback({
        comment: '',
        rating: 0,
        category: 'general',
        priority: 'medium',
        actionable: false
      })

      onSuccess?.()
    } catch (error) {
      console.error('Error submitting feedback:', error)
      alert('Failed to submit feedback. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Rating Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Overall Rating
        </label>
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleRatingChange(star)}
              className="text-2xl text-gray-300 hover:text-yellow-400 transition-colors"
            >
              {star <= feedback.rating ? (
                <StarIcon className="h-8 w-8 text-yellow-400" />
              ) : (
                <StarOutlineIcon className="h-8 w-8" />
              )}
            </button>
          ))}
          {feedback.rating > 0 && (
            <span className="ml-2 text-sm text-gray-600">
              {RATING_LABELS[feedback.rating as keyof typeof RATING_LABELS]}
            </span>
          )}
        </div>
      </div>

      {/* Category and Priority */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Feedback Category">
          <Select
            value={feedback.category}
            onChange={(value) => setFeedback(prev => ({ ...prev, category: value as any }))}
            options={CATEGORIES}
          />
        </FormField>

        <FormField label="Priority Level">
          <Select
            value={feedback.priority}
            onChange={(value) => setFeedback(prev => ({ ...prev, priority: value as any }))}
            options={PRIORITIES}
          />
        </FormField>
      </div>

      {/* Actionable Feedback Toggle */}
      <div className="flex items-center">
        <input
          id="actionable"
          type="checkbox"
          checked={feedback.actionable}
          onChange={(e) => setFeedback(prev => ({ ...prev, actionable: e.target.checked }))}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="actionable" className="ml-2 block text-sm text-gray-700">
          This feedback requires action or follow-up
        </label>
      </div>

      {/* Comment */}
      <FormField 
        label="Detailed Feedback"
        required
      >
        <Textarea
          value={feedback.comment}
          onChange={(e) => setFeedback(prev => ({ ...prev, comment: e.target.value }))}
          rows={4}
          placeholder="Provide detailed feedback, suggestions, or comments..."
          required
          minLength={10}
          maxLength={1000}
          disabled={loading}
        />
        <p className="mt-1 text-sm text-gray-500">
          {feedback.comment.length}/1000 characters
        </p>
      </FormField>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          loading={loading}
          disabled={!feedback.comment.trim() || feedback.rating === 0}
        >
          Submit Feedback
        </Button>
      </div>
    </form>
  )
} 