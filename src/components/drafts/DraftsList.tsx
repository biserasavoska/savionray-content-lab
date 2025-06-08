'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ContentDraft, DraftStatus, User } from '@prisma/client'
import { formatDistanceToNow } from 'date-fns'

interface DraftMetadata {
  contentType: 'social-media' | 'blog' | 'newsletter'
}

interface DraftsListProps {
  drafts: (ContentDraft & {
    createdBy: Pick<User, 'name' | 'email'>
    metadata?: DraftMetadata | null
  })[]
  ideaId: string
  onDelete?: (draftId: string) => void
}

const STATUS_COLORS: Record<DraftStatus, { bg: string; text: string; label: string }> = {
  PENDING_FEEDBACK: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    label: 'Pending Feedback'
  },
  AWAITING_FINAL_APPROVAL: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    label: 'Awaiting Approval'
  },
  APPROVED: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    label: 'Approved'
  }
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
    <div className="overflow-hidden bg-white shadow sm:rounded-md">
      <ul role="list" className="divide-y divide-gray-200">
        {drafts.map((draft) => {
          const statusConfig = STATUS_COLORS[draft.status]
          
          return (
            <li key={draft.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <p className="truncate text-sm font-medium text-red-600">
                      {draft.metadata?.contentType || 'Unknown Type'}
                    </p>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}
                    >
                      {statusConfig.label}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => router.push(`/ideas/${ideaId}/drafts/${draft.id}/edit`)}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(draft.id)}
                      disabled={isDeleting === draft.id}
                      className="inline-flex items-center px-3 py-1 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 disabled:opacity-50"
                    >
                      {isDeleting === draft.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      By {draft.createdBy.name || draft.createdBy.email}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <p>
                      Last updated {formatDistanceToNow(new Date(draft.updatedAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-900 line-clamp-2">{draft.body}</p>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
} 