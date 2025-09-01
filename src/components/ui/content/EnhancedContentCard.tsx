'use client'

import React, { useState } from 'react'
import { Card, CardFooter } from '@/components/ui/common/Card'
import Button from '@/components/ui/common/Button'
import ContentCardHeader from './ContentCardHeader'
import ContentCardBody from './ContentCardBody'
import ContentTypeBadge from './ContentTypeBadge'
import { 
  Edit, 
  Trash2, 
  Check, 
  Send, 
  Archive, 
  RotateCcw,
  MoreVertical,
  Eye,
  Copy
} from 'lucide-react'

export interface EnhancedContentCardProps {
  id: string
  title: string
  description?: string
  content?: string
  status: 'draft' | 'review' | 'approved' | 'published' | 'archived'
  contentType: 'article' | 'blog' | 'social' | 'video' | 'podcast' | 'newsletter' | 'image' | 'document' | 'audio' | 'rss'
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
  onView?: (id: string) => void
  onDuplicate?: (id: string) => void
  showActions?: boolean
  isSelected?: boolean
  onSelect?: (id: string, selected: boolean) => void
}

const EnhancedContentCard: React.FC<EnhancedContentCardProps> = ({
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
  onView,
  onDuplicate,
  showActions = true,
  isSelected = false,
  onSelect,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showMoreActions, setShowMoreActions] = useState(false)

  const getStatusActions = () => {
    const actions = []

    switch (status) {
      case 'draft':
        actions.push(
          onEdit && { icon: Edit, label: 'Edit', action: () => onEdit(id), variant: 'outline' as const },
          onView && { icon: Eye, label: 'Preview', action: () => onView(id), variant: 'ghost' as const },
          onDuplicate && { icon: Copy, label: 'Duplicate', action: () => onDuplicate(id), variant: 'ghost' as const },
          onDelete && { icon: Trash2, label: 'Delete', action: () => onDelete(id), variant: 'destructive' as const }
        )
        break
      case 'review':
        actions.push(
          onApprove && { icon: Check, label: 'Approve', action: () => onApprove(id), variant: 'default' as const },
          onEdit && { icon: Edit, label: 'Edit', action: () => onEdit(id), variant: 'outline' as const },
          onView && { icon: Eye, label: 'Preview', action: () => onView(id), variant: 'ghost' as const }
        )
        break
      case 'approved':
        actions.push(
          onPublish && { icon: Send, label: 'Publish', action: () => onPublish(id), variant: 'default' as const },
          onEdit && { icon: Edit, label: 'Edit', action: () => onEdit(id), variant: 'outline' as const },
          onView && { icon: Eye, label: 'Preview', action: () => onView(id), variant: 'ghost' as const }
        )
        break
      case 'published':
        actions.push(
          onArchive && { icon: Archive, label: 'Archive', action: () => onArchive(id), variant: 'outline' as const },
          onEdit && { icon: Edit, label: 'Edit', action: () => onEdit(id), variant: 'outline' as const },
          onView && { icon: Eye, label: 'View', action: () => onView(id), variant: 'ghost' as const }
        )
        break
      case 'archived':
        actions.push(
          onEdit && { icon: RotateCcw, label: 'Restore', action: () => onEdit(id), variant: 'outline' as const },
          onView && { icon: Eye, label: 'View', action: () => onView(id), variant: 'ghost' as const }
        )
        break
    }

    return actions.filter(Boolean)
  }

  const statusActions = getStatusActions()
  const primaryActions = statusActions.slice(0, 2)
  const moreActions = statusActions.slice(2)

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelect?.(id, e.target.checked)
  }

  return (
    <Card className={`h-full flex flex-col transition-all duration-200 hover:shadow-lg ${
      isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
    } ${className || ''}`}>
      {/* Selection Checkbox */}
      {onSelect && (
        <div className="absolute top-3 left-3 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleSelect}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </div>
      )}

      {/* Header */}
      <ContentCardHeader
        title={title}
        description={description}
        status={status}
        contentType={contentType}
        author={author}
        createdAt={createdAt}
        updatedAt={updatedAt}
        estimatedReadTime={estimatedReadTime}
        className={onSelect ? 'pl-8' : ''}
      />

      {/* Body */}
      <ContentCardBody
        content={content}
        tags={tags}
        priority={priority}
        isExpanded={isExpanded}
        onToggleExpand={setIsExpanded}
      />

      {/* Footer with Actions */}
      {showActions && (
        <CardFooter className="pt-0">
          <div className="flex items-center justify-between w-full">
            <ContentTypeBadge contentType={contentType} size="sm" />
            
            <div className="flex items-center gap-2">
              {/* Primary Actions */}
              {primaryActions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant}
                  size="sm"
                  onClick={action.action}
                  className="flex items-center gap-1"
                >
                  <action.icon className="h-3 w-3" />
                  <span className="hidden sm:inline">{action.label}</span>
                </Button>
              ))}
              
              {/* More Actions Dropdown */}
              {moreActions.length > 0 && (
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMoreActions(!showMoreActions)}
                    className="p-1"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                  
                  {showMoreActions && (
                    <div className="absolute right-0 bottom-full mb-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                      {moreActions.map((action, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            action.action()
                            setShowMoreActions(false)
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 first:rounded-t-md last:rounded-b-md"
                        >
                          <action.icon className="h-4 w-4" />
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}

export default EnhancedContentCard
