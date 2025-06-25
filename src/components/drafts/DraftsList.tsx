'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ContentDraft, DraftStatus, User } from '@prisma/client'
import { formatDistanceToNow, format } from 'date-fns'
import { DraftMetadata } from '@/types/draft'
import DraftActions from './DraftActions'

interface Draft {
  id: string
  status: DraftStatus
  createdAt: Date
  ideaId: string
  createdBy: {
    name: string | null
    email: string | null
  }
  feedbacks: {
    id: string
    comment: string
    createdAt: Date
    createdBy: {
      name: string | null
      email: string | null
    }
  }[]
}

const STATUS_COLORS: Record<DraftStatus, { bg: string; text: string; label: string }> = {
  DRAFT: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    label: 'Draft',
  },
  AWAITING_FEEDBACK: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    label: 'Awaiting Feedback',
  },
  AWAITING_REVISION: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    label: 'Awaiting Revision',
  },
  APPROVED: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    label: 'Approved',
  },
  REJECTED: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    label: 'Rejected',
  },
  PUBLISHED: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    label: 'Published',
  },
}

interface DraftsListProps {
  drafts: Draft[]
  ideaId: string
  onDelete?: (draftId: string) => void
}

export default function DraftsList({ drafts, ideaId, onDelete }: DraftsListProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const handleDelete = async (draftId: string) => {
    if (!confirm('Are you sure you want to delete this draft?')) return

    setIsDeleting(draftId)
    try {
      const response = await fetch(`/api/drafts/${draftId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete draft')
      }

      onDelete?.(draftId)
      router.refresh()
    } catch (error) {
      console.error('Failed to delete draft:', error)
      alert('Failed to delete draft. Please try again.')
    } finally {
      setIsDeleting(null)
    }
  }

  if (drafts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No drafts yet.</p>
        <button
          onClick={() => router.push(`/ideas/${ideaId}/drafts/new`)}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
        >
          Create First Draft
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {drafts.map((draft) => (
        <div key={draft.id} className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Draft by {draft.createdBy.name || draft.createdBy.email}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Created on {format(new Date(draft.createdAt), 'MMM d, yyyy')}
                </p>
              </div>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  STATUS_COLORS[draft.status].bg
                } ${STATUS_COLORS[draft.status].text}`}
              >
                {STATUS_COLORS[draft.status].label}
              </span>
            </div>

            <div className="mt-6">
              <DraftActions draftId={draft.id} currentStatus={draft.status} ideaId={draft.ideaId} />
            </div>

            {draft.feedbacks.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900">Feedback History</h4>
                <div className="mt-2 space-y-4">
                  {draft.feedbacks.map((feedback) => (
                    <div key={feedback.id} className="text-sm text-gray-700">
                      <p className="font-medium">
                        {feedback.createdBy.name || feedback.createdBy.email}
                      </p>
                      <p className="mt-1">{feedback.comment}</p>
                      <p className="mt-1 text-gray-500">
                        {format(new Date(feedback.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
} 