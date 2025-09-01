'use client'

import React from 'react'
import { CardHeader } from '@/components/ui/common/Card'
import StatusBadge from '@/components/ui/common/StatusBadge'
import Badge from '@/components/ui/common/Badge'
import { Clock, User, Calendar } from 'lucide-react'

export interface ContentCardHeaderProps {
  title: string
  description?: string
  status: 'draft' | 'review' | 'approved' | 'published' | 'archived'
  contentType: 'article' | 'blog' | 'social' | 'video' | 'podcast' | 'newsletter'
  author?: string
  createdAt: Date
  updatedAt: Date
  estimatedReadTime?: number
  className?: string
}

const ContentCardHeader: React.FC<ContentCardHeaderProps> = ({
  title,
  description,
  status,
  contentType,
  author,
  createdAt,
  updatedAt,
  estimatedReadTime,
  className,
}) => {
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

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(date))
  }

  return (
    <CardHeader className={`pb-3 ${className || ''}`}>
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
          
          {/* Metadata Row */}
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
            {author && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{author}</span>
              </div>
            )}
            {estimatedReadTime && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{estimatedReadTime} min read</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>Created: {formatDate(createdAt)}</span>
              {updatedAt > createdAt && (
                <span className="ml-2">Updated: {formatDate(updatedAt)}</span>
              )}
            </div>
          </div>
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
  )
}

export default ContentCardHeader
