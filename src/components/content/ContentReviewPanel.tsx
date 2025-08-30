'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'

import { useInterface } from '@/hooks/useInterface'
import Button from '@/components/ui/common/Button'
import Badge from '@/components/ui/common/Badge'

interface ContentReviewPanelProps {
  content: ContentReviewData
  onSubmitFeedback: (feedback: ContentFeedback) => void
  onApprove: () => void
  onRequestRevision: () => void
}

export interface ContentReviewData {
  id: string
  title: string
  description: string
  contentType: string
  content: string
  status: 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'PUBLISHED'
  createdBy: {
    name: string
    email: string
  }
  createdAt: Date
  updatedAt: Date
  media?: {
    url: string
    type: string
    filename: string
  }[]
  metadata?: {
    targetAudience?: string
    keywords?: string[]
    seoDescription?: string
  }
}

export interface ContentFeedback {
  overallRating: number
  feedback: string
  suggestions: string[]
  approved: boolean
  revisionRequested: boolean
  revisionNotes?: string
}

export default function ContentReviewPanel({
  content,
  onSubmitFeedback,
  onApprove,
  onRequestRevision
}: ContentReviewPanelProps) {
  const { data: session } = useSession()
  const interfaceContext = useInterface()
  const [feedback, setFeedback] = useState<ContentFeedback>({
    overallRating: 5,
    feedback: '',
    suggestions: [],
    approved: false,
    revisionRequested: false,
    revisionNotes: ''
  })

  const [newSuggestion, setNewSuggestion] = useState('')
  const [showRevisionForm, setShowRevisionForm] = useState(false)

  const isClientUser = interfaceContext.isClient

  const handleRatingChange = (rating: number) => {
    setFeedback(prev => ({ ...prev, overallRating: rating }))
  }

  const addSuggestion = () => {
    if (newSuggestion.trim() && !feedback.suggestions.includes(newSuggestion.trim())) {
      setFeedback(prev => ({
        ...prev,
        suggestions: [...prev.suggestions, newSuggestion.trim()]
      }))
      setNewSuggestion('')
    }
  }

  const removeSuggestion = (suggestion: string) => {
    setFeedback(prev => ({
      ...prev,
      suggestions: prev.suggestions.filter(s => s !== suggestion)
    }))
  }

  const handleSubmitFeedback = () => {
    onSubmitFeedback(feedback)
  }

  const handleApprove = () => {
    setFeedback(prev => ({ ...prev, approved: true, revisionRequested: false }))
    onApprove()
  }

  const handleRequestRevision = () => {
    setFeedback(prev => ({ ...prev, revisionRequested: true, approved: false }))
    setShowRevisionForm(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'default'
      case 'IN_REVIEW': return 'secondary'
      case 'APPROVED': return 'default'
      case 'REJECTED': return 'destructive'
      case 'PUBLISHED': return 'default'
      default: return 'default'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'Draft'
      case 'IN_REVIEW': return 'In Review'
      case 'APPROVED': return 'Approved'
      case 'REJECTED': return 'Rejected'
      case 'PUBLISHED': return 'Published'
      default: return status
    }
  }

  if (!isClientUser) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">
          This review panel is only available for client users.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Content Review
            </h2>
            <p className="text-gray-600">
              Review and provide feedback on the content below
            </p>
          </div>
          <Badge variant={getStatusColor(content.status)}>
            {getStatusText(content.status)}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Created by:</span>
            <p className="text-gray-600">{content.createdBy.name}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Content Type:</span>
            <p className="text-gray-600">{content.contentType}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Last Updated:</span>
            <p className="text-gray-600">
              {new Date(content.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Content Preview */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Preview</h3>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-900 mb-2">{content.title}</h4>
          <p className="text-gray-700 mb-3">{content.description}</p>
          
          {content.metadata?.targetAudience && (
            <div className="mb-2">
              <span className="text-sm font-medium text-gray-600">Target Audience:</span>
              <span className="text-sm text-gray-700 ml-2">{content.metadata.targetAudience}</span>
            </div>
          )}

          {content.metadata?.keywords && content.metadata.keywords.length > 0 && (
            <div className="mb-3">
              <span className="text-sm font-medium text-gray-600">Keywords:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {content.metadata.keywords.map((keyword, index) => (
                  <Badge key={index} variant="default" size="sm">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="prose max-w-none">
          <div dangerouslySetInnerHTML={{ __html: content.content }} />
        </div>

        {content.media && content.media.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold text-gray-900 mb-2">Attached Media</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {content.media.map((media, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-2">
                  <div className="text-sm font-medium text-gray-700 truncate">
                    {media.filename}
                  </div>
                  <div className="text-xs text-gray-500">{media.type}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Review Form */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Review & Feedback</h3>

        {/* Overall Rating */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Overall Rating
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleRatingChange(rating)}
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-colors ${
                  rating <= feedback.overallRating
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'bg-white border-gray-300 text-gray-400 hover:border-blue-300'
                }`}
              >
                {rating}
              </button>
            ))}
            <span className="ml-2 text-sm text-gray-600">
              {feedback.overallRating}/5 stars
            </span>
          </div>
        </div>

        {/* General Feedback */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            General Feedback
          </label>
          <textarea
            value={feedback.feedback}
            onChange={(e) => setFeedback(prev => ({ ...prev, feedback: e.target.value }))}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Share your thoughts about the content..."
          />
        </div>

        {/* Suggestions */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Suggestions for Improvement
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {feedback.suggestions.map((suggestion, index) => (
              <Badge key={index} variant="default" className="cursor-pointer" onClick={() => removeSuggestion(suggestion)}>
                {suggestion} ×
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newSuggestion}
              onChange={(e) => setNewSuggestion(e.target.value)}
              placeholder="Add a suggestion"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addSuggestion()
                }
              }}
            />
            <Button type="button" variant="secondary" onClick={addSuggestion}>
              Add
            </Button>
          </div>
        </div>

        {/* Revision Request Form */}
        {showRevisionForm && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">Revision Request</h4>
            <textarea
              value={feedback.revisionNotes || ''}
              onChange={(e) => setFeedback(prev => ({ ...prev, revisionNotes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Please specify what changes are needed..."
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={handleRequestRevision}
            disabled={showRevisionForm}
          >
            Request Revision
          </Button>
          <Button
            type="button"
            variant="default"
            onClick={handleApprove}
          >
            Approve Content
          </Button>
          <Button
            type="button"
            variant="default"
            onClick={handleSubmitFeedback}
          >
            Submit Feedback
          </Button>
        </div>
      </div>
    </div>
  )
} 