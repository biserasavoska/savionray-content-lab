'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardContent } from '@/components/ui/common/Card'
import { Button } from '@/components/ui/common/Button'
import { Select } from '@/components/ui/common/Select'
import { Badge } from '@/components/ui/common/Badge'
import { ContentCardProps } from './ContentCard'

export interface ContentCardActionsProps {
  selectedItems: string[]
  onBulkAction: (action: string, itemIds: string[]) => void
  onSelectAll: () => void
  onClearSelection: () => void
  totalItems: number
  className?: string
}

const ContentCardActions: React.FC<ContentCardActionsProps> = ({
  selectedItems,
  onBulkAction,
  onSelectAll,
  onClearSelection,
  totalItems,
  className,
}) => {
  const [bulkAction, setBulkAction] = useState<string>('')

  const handleBulkAction = () => {
    if (bulkAction && selectedItems.length > 0) {
      onBulkAction(bulkAction, selectedItems)
      setBulkAction('')
    }
  }

  const getBulkActionOptions = () => {
    const options = [
      { value: '', label: 'Select Action' },
      { value: 'approve', label: 'Approve Selected' },
      { value: 'publish', label: 'Publish Selected' },
      { value: 'archive', label: 'Archive Selected' },
      { value: 'delete', label: 'Delete Selected' },
      { value: 'move-to-review', label: 'Move to Review' },
      { value: 'add-tag', label: 'Add Tag' },
      { value: 'change-priority', label: 'Change Priority' },
    ]
    return options
  }

  const getActionButtonVariant = (action: string) => {
    switch (action) {
      case 'delete':
        return 'destructive'
      case 'approve':
      case 'publish':
        return 'default'
      default:
        return 'outline'
    }
  }

  const getActionButtonText = (action: string) => {
    switch (action) {
      case 'approve':
        return 'Approve'
      case 'publish':
        return 'Publish'
      case 'archive':
        return 'Archive'
      case 'delete':
        return 'Delete'
      case 'move-to-review':
        return 'Move to Review'
      case 'add-tag':
        return 'Add Tag'
      case 'change-priority':
        return 'Change Priority'
      default:
        return 'Apply Action'
    }
  }

  if (selectedItems.length === 0) {
    return null
  }

  return (
    <Card className={`sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-blue-200 ${className || ''}`}>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-blue-900">
              Bulk Actions
            </h3>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {selectedItems.length} selected
            </Badge>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onSelectAll}
              disabled={selectedItems.length === totalItems}
            >
              Select All ({totalItems})
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClearSelection}
            >
              Clear Selection
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Bulk Action Selector */}
            <div className="sm:col-span-2">
              <Select
                value={bulkAction}
                onValueChange={setBulkAction}
                className="w-full"
              >
                {getBulkActionOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
            
            {/* Apply Action Button */}
            <Button
              variant={getActionButtonVariant(bulkAction)}
              size="default"
              onClick={handleBulkAction}
              disabled={!bulkAction || selectedItems.length === 0}
              className="w-full sm:w-auto"
            >
              {getActionButtonText(bulkAction)}
            </Button>
          </div>
          
          {/* Quick Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onBulkAction('approve', selectedItems)}
              disabled={selectedItems.length === 0}
            >
              Quick Approve
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onBulkAction('publish', selectedItems)}
              disabled={selectedItems.length === 0}
            >
              Quick Publish
            </Button>
          </div>
        </div>
        
        {/* Selection Summary */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
            <span>Selected items:</span>
            {selectedItems.slice(0, 3).map((id, index) => (
              <Badge key={id} variant="outline" size="sm">
                {id.substring(0, 8)}...
              </Badge>
            ))}
            {selectedItems.length > 3 && (
              <Badge variant="outline" size="sm">
                +{selectedItems.length - 3} more
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ContentCardActions
