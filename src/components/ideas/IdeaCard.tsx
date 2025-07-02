'use client'

import type { Idea, User, ContentDraft } from '../../types/content'
import { IDEA_STATUS } from '../../lib/utils/enum-constants'
import { formatDistanceToNow } from 'date-fns'
import { useSession } from 'next-auth/react'
import { isClient, isAdmin } from '@/lib/auth'
import IdeaFeedbackPanel from './IdeaFeedbackPanel'
import { IdeaWithCreator } from '@/types/idea'
import { formatDate } from '../../lib/utils/date-helpers'

// Local types
type IdeaStatus = typeof IDEA_STATUS[keyof typeof IDEA_STATUS]

interface Feedback {
  id: string
  comment: string
  createdAt: Date
  createdBy: User
  contentDraftId: string
}

interface IdeaComment {
  id: string
  comment: string
  createdAt: Date
  createdBy: User
  ideaId: string
}

interface IdeaCardProps {
  idea: IdeaWithCreator
  onStatusChange?: (id: string, status: IdeaStatus) => void
  onEdit?: (idea: IdeaWithCreator) => void
  onDelete?: (id: string) => void
}

export default function IdeaCard({ idea, onStatusChange, onEdit, onDelete }: IdeaCardProps) {
  const { data: session } = useSession()
  const isCreator = session?.user?.id === idea.createdById

  const handleDelete = async () => {
    if (!onDelete) return
    if (window.confirm('Are you sure you want to delete this idea?')) {
      onDelete(idea.id)
    }
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900">{idea.title}</h3>
          <p className="mt-1 text-sm text-gray-500">
            by {idea.createdBy.name || idea.createdBy.email} •{' '}
            {formatDistanceToNow(new Date(idea.createdAt), { addSuffix: true })}
          </p>
        </div>
        <div className="ml-4 flex-shrink-0">
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
            ${idea.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
              idea.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'}`}>
            {idea.status.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      <p className="mt-3 text-sm text-gray-600">{idea.description}</p>

      {/* Additional idea details */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        {idea.publishingDateTime && (
          <div>
            <span className="text-sm font-medium text-gray-500">Publishing Date:</span>
            <span className="ml-2 text-sm text-gray-900">
              {formatDate(idea.publishingDateTime)}
            </span>
          </div>
        )}
        {idea.mediaType && (
          <div>
            <span className="text-sm font-medium text-gray-500">Media Type:</span>
            <span className="ml-2 text-sm text-gray-900">
              {idea.mediaType.replace(/_/g, ' ')}
            </span>
          </div>
        )}
        {idea.contentType && (
          <div>
            <span className="text-sm font-medium text-gray-500">Content Type:</span>
            <span className="ml-2 text-sm text-gray-900">
              {idea.contentType.replace(/_/g, ' ')}
            </span>
          </div>
        )}
        {idea.savedForLater && (
          <div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Saved for Later
            </span>
          </div>
        )}
      </div>

      {/* Action buttons for creator */}
      {(isCreator || isAdmin(session)) && (
        <div className="mt-4 flex justify-end space-x-3">
          <button
            onClick={() => onEdit?.(idea)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete
          </button>
        </div>
      )}

      {/* Feedback Panel */}
      <IdeaFeedbackPanel idea={idea} />
    </div>
  )
} 