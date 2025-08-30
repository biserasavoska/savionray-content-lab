'use client'

import React from 'react'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/common/Card'
import Button from '@/components/ui/common/Button'
import StatusBadge from '@/components/ui/common/StatusBadge'
import Badge from '@/components/ui/common/Badge'

export interface ContentCardProps {
  id: string
  title: string
  description?: string
  content?: string
  status: 'draft' | 'review' | 'approved' | 'published' | 'archived'
  contentType: 'article' | 'blog' | 'social' | 'video' | 'podcast' | 'newsletter'
  author?: string
  createdAt: Date
  updatedAt: Date
  tags?: string[]
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  estimatedReadTime?: number
  className?: string
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onApprove?: (id: string) => void
  onPublish?: (id: string) => void
  onArchive?: (id: string) => void
}

const ContentCard: React.FC<ContentCardProps> = ({
  id,
  title,
  description,
  content,
  status,
  contentType,
  author,
  createdAt,
  updatedAt,
  tags = [],
  priority = 'medium',
  estimatedReadTime,
  className,
  onEdit,
  onDelete,
  onApprove,
  onPublish,
  onArchive,
}) => {
  const priorityColors = {
    low: 'bg-blue-100 text-blue-800 border-blue-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    urgent: 'bg-red-100 text-red-800 border-red-200',
  }

  const contentTypeColors = {
    article: 'bg-purple-100 text-purple-800 border-purple-200',
    blog: 'bg-green-100 text-green-800 border-green-200',
    social: 'bg-blue-100 text-blue-800 border-blue-200',
    video: 'bg-red-100 text-red-800 border-red-200',
    podcast: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    newsletter: 'bg-pink-100 text-pink-800 border-pink-200',
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date))
  }

  const getStatusActions = () => {
    switch (status) {
      case 'draft':
        return (
          <>
            {onEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(id)}>
                Edit
              </Button>
            )}
            {onDelete && (
              <Button variant="destructive" size="sm" onClick={() => onDelete(id)}>
                Delete
              </Button>
            )}
          </>
        )
      case 'review':
        return (
          <>
            {onApprove && (
              <Button variant="default" size="sm" onClick={() => onApprove(id)}>
                Approve
              </Button>
            )}
            {onEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(id)}>
                Edit
              </Button>
            )}
          </>
        )
      case 'approved':
        return (
          <>
            {onPublish && (
              <Button variant="default" size="sm" onClick={() => onPublish(id)}>
                Publish
              </Button>
            )}
            {onEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(id)}>
                Edit
              </Button>
            )}
          </>
        )
      case 'published':
        return (
          <>
            {onArchive && (
              <Button variant="outline" size="sm" onClick={() => onArchive(id)}>
                Archive
              </Button>
            )}
            {onEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(id)}>
                Edit
              </Button>
            )}
          </>
        )
      case 'archived':
        return (
          <>
            {onEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(id)}>
                Restore
              </Button>
            )}
          </>
        )
      default:
        return null
    }
  }

  return (
    <Card className={`h-full flex flex-col ${className || ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate" title={title}>
              {title}
            </h3>
            {description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2" title={description}>
                {description}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusBadge status={status} size="sm" />
            <Badge 
              variant="outline" 
              className={`text-xs ${contentTypeColors[contentType]}`}
            >
              {contentType}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        {content && (
          <div className="text-sm text-gray-700 line-clamp-3 mb-3">
            {content}
          </div>
        )}
        
        <div className="space-y-2">
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" size="sm">
                  {tag}
                </Badge>
              ))}
              {tags.length > 3 && (
                <Badge variant="outline" size="sm">
                  +{tags.length - 3}
                </Badge>
              )}
            </div>
          )}
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-3">
              {author && <span>By {author}</span>}
              {estimatedReadTime && <span>{estimatedReadTime} min read</span>}
            </div>
            <div className="flex items-center gap-2">
              <span>Created: {formatDate(createdAt)}</span>
              {updatedAt > createdAt && <span>Updated: {formatDate(updatedAt)}</span>}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex items-center justify-between w-full">
          <Badge 
            variant="outline" 
            className={`text-xs ${priorityColors[priority]}`}
          >
            {priority}
          </Badge>
          
          <div className="flex gap-2">
            {getStatusActions()}
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

export default ContentCard
