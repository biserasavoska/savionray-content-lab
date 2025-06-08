'use client'

import { Idea, IdeaStatus, User } from '@prisma/client'
import { formatDistanceToNow } from 'date-fns'
import { useSession } from 'next-auth/react'
import { isClient, isAdmin } from '@/lib/auth'

type IdeaWithCreator = Idea & {
  createdBy: Pick<User, 'name' | 'email'>
}

interface IdeaCardProps {
  idea: IdeaWithCreator
  onStatusChange?: (id: string, status: IdeaStatus) => Promise<void>
  onEdit?: (idea: IdeaWithCreator) => void
  onDelete?: (id: string) => Promise<void>
}

export default function IdeaCard({ idea, onStatusChange, onEdit, onDelete }: IdeaCardProps) {
  const { data: session } = useSession()
  const canModify = session?.user?.id === idea.createdById || isAdmin(session)
  const canChangeStatus = isClient(session) || isAdmin(session)

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    APPROVED_BY_CLIENT: 'bg-green-100 text-green-800',
    REJECTED_BY_CLIENT: 'bg-red-100 text-red-800',
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{idea.title}</h3>
          <p className="text-sm text-gray-500">
            By {idea.createdBy.name || idea.createdBy.email} •{' '}
            {formatDistanceToNow(new Date(idea.createdAt), { addSuffix: true })}
          </p>
        </div>
        {canModify && (
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit?.(idea)}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete?.(idea.id)}
              className="text-sm text-red-600 hover:text-red-900"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      <p className="text-gray-600">{idea.description}</p>

      <div className="flex justify-between items-center pt-4">
        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[idea.status]}`}>
          {idea.status.replace('_', ' ')}
        </div>

        {canChangeStatus && idea.status === 'PENDING' && (
          <div className="flex space-x-2">
            <button
              onClick={() => onStatusChange?.(idea.id, 'APPROVED_BY_CLIENT')}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              Approve
            </button>
            <button
              onClick={() => onStatusChange?.(idea.id, 'REJECTED_BY_CLIENT')}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 