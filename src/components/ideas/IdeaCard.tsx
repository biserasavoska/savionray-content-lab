'use client'

import type { Idea, User, ContentDraft } from '../../types/content'
import { IDEA_STATUS, getStatusBadgeClasses } from '../../lib/utils/enum-utils'
import { formatDistanceToNow } from 'date-fns'
import { useSession } from 'next-auth/react'
import { isClient, isAdmin } from '@/lib/auth'
import IdeaFeedbackPanel from './IdeaFeedbackPanel'
import { IdeaWithCreator } from '@/types/idea'
import { formatDate } from '../../lib/utils/date-helpers'
import Card, { CardHeader, CardContent, CardFooter } from '@/components/ui/common/Card'
import Badge from '@/components/ui/common/Badge'
import Button from '@/components/ui/common/Button'

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
  variant?: 'default' | 'elevated' | 'outlined'
}

export default function IdeaCard({ 
  idea, 
  onStatusChange, 
  onEdit, 
  onDelete, 
  variant = 'default' 
}: IdeaCardProps) {
  const { data: session } = useSession()
  const isCreator = session?.user?.id === idea.createdById

  const handleDelete = async () => {
    if (!onDelete) return
    if (window.confirm('Are you sure you want to delete this idea?')) {
      onDelete(idea.id)
    }
  }

  // Get status badge variant based on status
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'success'
      case 'PENDING':
        return 'warning'
      case 'REJECTED':
        return 'error'
      case 'DRAFT':
        return 'info'
      default:
        return 'default'
    }
  }

  return (
    <Card variant={variant} className="hover:shadow-md transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {idea.title}
          </h3>
          <Badge variant={getStatusBadgeVariant(idea.status)}>
            {idea.status.replace(/_/g, ' ')}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            by {idea.createdBy.name || idea.createdBy.email} •{' '}
            {formatDistanceToNow(new Date(idea.createdAt), { addSuffix: true })}
          </p>
          {idea.organization && (
            <Badge variant="secondary" size="sm">
              {idea.organization.name}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-gray-600 mb-4">{idea.description}</p>

        {/* Additional idea details */}
        <div className="grid grid-cols-2 gap-4">
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
              <Badge variant="info">Saved for Later</Badge>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <div className="w-full">
          {/* Action buttons for creator */}
          {(isCreator || isAdmin(session)) && (
            <div className="flex justify-end space-x-3 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit?.(idea)}
              >
                Edit
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
              >
                Delete
              </Button>
            </div>
          )}

          {/* Feedback Panel */}
          <IdeaFeedbackPanel idea={idea} />
        </div>
      </CardFooter>
    </Card>
  )
} 