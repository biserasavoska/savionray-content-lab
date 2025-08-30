'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardHeader, CardContent } from '@/components/ui/common/Card'
import Button from '@/components/ui/common/Button'
import { Select, Input } from '@/components/ui/common/FormField'
import Badge from '@/components/ui/common/Badge'
import LoadingSpinner from '@/components/ui/common/LoadingSpinner'
import ErrorDisplay from '@/components/ui/common/ErrorDisplay'
import ContentCard, { ContentCardProps } from './ContentCard'

export interface ContentCardGridProps {
  content: ContentCardProps[]
  loading?: boolean
  error?: string | null
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onApprove?: (id: string) => void
  onPublish?: (id: string) => void
  onArchive?: (id: string) => void
  className?: string
}

export type SortOption = 'newest' | 'oldest' | 'title' | 'priority' | 'status'
export type FilterOption = 'all' | 'draft' | 'review' | 'approved' | 'published' | 'archived'

const ContentCardGrid: React.FC<ContentCardGridProps> = ({
  content,
  loading = false,
  error = null,
  onEdit,
  onDelete,
  onApprove,
  onPublish,
  onArchive,
  className,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<FilterOption>('all')
  const [contentTypeFilter, setContentTypeFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Get unique content types and priorities for filters
  const contentTypes = useMemo(() => {
    const types = [...new Set(content.map(item => item.contentType))]
    return types.sort()
  }, [content])

  const priorities = useMemo(() => {
    const prios = [...new Set(content.map(item => item.priority))]
    return prios.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
      return priorityOrder[b as keyof typeof priorityOrder] - priorityOrder[a as keyof typeof priorityOrder]
    })
  }, [content])

  // Filter and sort content
  const filteredAndSortedContent = useMemo(() => {
    const filtered = content.filter(item => {
      const matchesSearch = searchTerm === '' || 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter
      const matchesContentType = contentTypeFilter === 'all' || item.contentType === contentTypeFilter
      const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter
      
      return matchesSearch && matchesStatus && matchesContentType && matchesPriority
    })

    // Sort content
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        case 'oldest':
          return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        case 'title':
          return a.title.localeCompare(b.title)
        case 'priority': {
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder]
        }
        case 'status': {
          const statusOrder = { draft: 1, review: 2, approved: 3, published: 4, archived: 5 }
          return statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder]
        }
        default:
          return 0
      }
    })

    return filtered
  }, [content, searchTerm, statusFilter, contentTypeFilter, priorityFilter, sortBy])

  const handleClearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setContentTypeFilter('all')
    setPriorityFilter('all')
    setSortBy('newest')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <ErrorDisplay 
        title="Error Loading Content" 
        message={error}
        className="py-12"
      />
    )
  }

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Filters and Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <h2 className="text-xl font-semibold">Content Management</h2>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                List
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <Input
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            {/* Status Filter */}
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as FilterOption)}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'draft', label: 'Draft' },
                { value: 'review', label: 'Review' },
                { value: 'approved', label: 'Approved' },
                { value: 'published', label: 'Published' },
                { value: 'archived', label: 'Archived' }
              ]}
            />
            
            {/* Sort */}
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              options={[
                { value: 'newest', label: 'Newest First' },
                { value: 'oldest', label: 'Oldest First' },
                { value: 'title', label: 'Title A-Z' },
                { value: 'priority', label: 'Priority' },
                { value: 'status', label: 'Status' }
              ]}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            {/* Content Type Filter */}
            <Select
              value={contentTypeFilter}
              onChange={(e) => setContentTypeFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Types' },
                ...contentTypes.map(type => ({
                  value: type,
                  label: type.charAt(0).toUpperCase() + type.slice(1)
                }))
              ]}
            />
            
            {/* Priority Filter */}
            <Select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Priorities' },
                ...priorities.map(priority => ({
                  value: priority || '',
                  label: (priority || '').charAt(0).toUpperCase() + (priority || '').slice(1)
                }))
              ]}
            />
            
            {/* Clear Filters */}
            <div className="lg:col-span-2 flex justify-end">
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            </div>
          </div>
          
          {/* Results Summary */}
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {filteredAndSortedContent.length} of {content.length} items
            </span>
            {searchTerm || statusFilter !== 'all' || contentTypeFilter !== 'all' || priorityFilter !== 'all' ? (
              <Badge variant="secondary">
                Filtered
              </Badge>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* Content Grid */}
      {filteredAndSortedContent.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center">
            <p className="text-gray-500 text-lg">No content found matching your criteria</p>
            <Button variant="outline" onClick={handleClearFilters} className="mt-4">
              Clear All Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
        }>
          {filteredAndSortedContent.map((item) => (
            <ContentCard
              key={item.id}
              {...item}
              onEdit={onEdit}
              onDelete={onDelete}
              onApprove={onApprove}
              onPublish={onPublish}
              onArchive={onArchive}
              className={viewMode === 'list' ? 'flex-row' : ''}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default ContentCardGrid
