'use client'

import React, { useState } from 'react'
import { CardContent } from '@/components/ui/common/Card'
import Badge from '@/components/ui/common/Badge'
import Button from '@/components/ui/common/Button'
import { ChevronDown, ChevronUp, Tag } from 'lucide-react'

export interface ContentCardBodyProps {
  content?: string
  tags?: string[]
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  isExpanded?: boolean
  onToggleExpand?: (expanded: boolean) => void
  className?: string
}

const ContentCardBody: React.FC<ContentCardBodyProps> = ({
  content,
  tags = [],
  priority = 'medium',
  isExpanded = false,
  onToggleExpand,
  className,
}) => {
  const [localExpanded, setLocalExpanded] = useState(isExpanded)
  
  const priorityColors = {
    low: 'bg-blue-100 text-blue-800 border-blue-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    urgent: 'bg-red-100 text-red-800 border-red-200',
  }

  const handleToggleExpand = () => {
    const newExpanded = !localExpanded
    setLocalExpanded(newExpanded)
    onToggleExpand?.(newExpanded)
  }

  const shouldShowExpandButton = content && content.length > 150

  return (
    <CardContent className={`flex-1 pb-3 ${className || ''}`}>
      {/* Content Preview */}
      {content && (
        <div className="mb-4">
          <div className={`text-sm text-gray-700 prose prose-sm max-w-none ${
            localExpanded ? '' : 'line-clamp-3'
          }`}>
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </div>
          
          {shouldShowExpandButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleExpand}
              className="mt-2 p-0 h-auto text-xs text-blue-600 hover:text-blue-800"
            >
              {localExpanded ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  Show More
                </>
              )}
            </Button>
          )}
        </div>
      )}
      
      {/* Tags Section */}
      {tags.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="h-3 w-3 text-gray-500" />
            <span className="text-xs font-medium text-gray-600">Tags</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" size="sm">
                {tag}
              </Badge>
            ))}
            {tags.length > 3 && (
              <Badge variant="outline" size="sm" className="text-xs">
                +{tags.length - 3} more
              </Badge>
            )}
          </div>
        </div>
      )}
      
      {/* Priority Indicator */}
      <div className="flex items-center justify-between">
        <Badge 
          variant="outline" 
          className={`text-xs ${priorityColors[priority]}`}
        >
          Priority: {priority}
        </Badge>
        
        {/* Additional metadata could go here */}
        <div className="text-xs text-gray-500">
          {/* Placeholder for additional metadata */}
        </div>
      </div>
    </CardContent>
  )
}

export default ContentCardBody
