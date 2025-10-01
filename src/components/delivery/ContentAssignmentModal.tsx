'use client'

import { useState, useEffect } from 'react'
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import Button from '@/components/ui/common/Button'
import { useOrganization } from '@/lib/contexts/OrganizationContext'

interface Idea {
  id: string
  title: string
  description: string
  status: string
  contentType: string
  publishingDateTime: string | null
  User: {
    id: string
    name: string | null
    email: string | null
  }
  ContentDraft?: Array<{
    id: string
    status: string
    createdAt: string
  }>
}

interface ContentDeliveryItem {
  id: string
  contentType: string
  quantity: number
  dueDate: Date | string
  Idea?: Array<{
    id: string
  }>
}

interface ContentDeliveryPlan {
  id: string
  name: string
  targetMonth: Date | string
}

interface ContentAssignmentModalProps {
  deliveryItem: ContentDeliveryItem
  plan: ContentDeliveryPlan
  isOpen: boolean
  onClose: () => void
  onAssignSuccess: () => void
}

export default function ContentAssignmentModal({
  deliveryItem,
  plan,
  isOpen,
  onClose,
  onAssignSuccess,
}: ContentAssignmentModalProps) {
  const { currentOrganization } = useOrganization()
  const [suggestions, setSuggestions] = useState<Idea[]>([])
  const [availableIdeas, setAvailableIdeas] = useState<Idea[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(true)

  useEffect(() => {
    if (isOpen) {
      fetchSuggestionsAndAvailable()
    }
  }, [isOpen])

  const fetchSuggestionsAndAvailable = async () => {
    setLoading(true)
    try {
      if (!currentOrganization?.id) {
        console.error('No organization selected for fetching suggestions')
        return
      }

      // Fetch smart suggestions
      const suggestionsRes = await fetch(
        `/api/delivery-items/${deliveryItem.id}/suggestions`,
        {
          headers: {
            'x-selected-organization': currentOrganization.id,
          },
        }
      )
      if (suggestionsRes.ok) {
        const data = await suggestionsRes.json()
        // Use suggestions as both suggestions and available ideas
        // They already match the plan's organization, content type, and period
        setSuggestions(data.suggestions || [])
        setAvailableIdeas(data.suggestions || [])
      } else {
        console.error('Failed to fetch suggestions:', suggestionsRes.status, suggestionsRes.statusText)
      }
    } catch (error) {
      console.error('Error fetching ideas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleSelect = (ideaId: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(ideaId)) {
      newSelected.delete(ideaId)
    } else {
      newSelected.add(ideaId)
    }
    setSelectedIds(newSelected)
  }

  const handleSelectAll = (ideas: Idea[]) => {
    const newSelected = new Set(selectedIds)
    ideas.forEach(idea => newSelected.add(idea.id))
    setSelectedIds(newSelected)
  }

  const handleAssignSelected = async () => {
    if (selectedIds.size === 0) {
      alert('Please select at least one idea to assign')
      return
    }

    const assignedCount = deliveryItem.Idea?.length || 0
    const remainingSlots = deliveryItem.quantity - assignedCount

    if (selectedIds.size > remainingSlots) {
      if (!confirm(
        `You selected ${selectedIds.size} ideas, but only ${remainingSlots} slots are available. ` +
        `Do you want to assign the first ${remainingSlots} ideas?`
      )) {
        return
      }
    }

    setAssigning(true)
    try {
      const response = await fetch(
        `/api/delivery-items/${deliveryItem.id}/assign`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ideaIds: Array.from(selectedIds) }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to assign ideas')
      }

      onAssignSuccess()
    } catch (error) {
      console.error('Error assigning ideas:', error)
      alert(error instanceof Error ? error.message : 'Failed to assign ideas. Please try again.')
    } finally {
      setAssigning(false)
    }
  }

  const filteredIdeas = availableIdeas.filter(idea =>
    searchTerm === '' ||
    idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    idea.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const displayedIdeas = showSuggestions && suggestions.length > 0 ? suggestions : filteredIdeas

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900">
              Assign Content to {deliveryItem.contentType.replace(/_/g, ' ')}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {deliveryItem.Idea?.length || 0}/{deliveryItem.quantity} assigned
              {selectedIds.size > 0 && ` • ${selectedIds.size} selected`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 border-b border-gray-200 space-y-3">
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search ideas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={showSuggestions}
                  onChange={(e) => setShowSuggestions(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled={suggestions.length === 0}
                />
                <span className="text-gray-700">
                  Smart Suggestions ({suggestions.length})
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading available ideas...</p>
            </div>
          ) : displayedIdeas.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {showSuggestions
                  ? 'No suggestions available. Try showing all ideas.'
                  : 'No unassigned ideas found for this period and content type.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayedIdeas.map((idea) => (
                <div
                  key={idea.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedIds.has(idea.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleToggleSelect(idea.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(idea.id)}
                        onChange={() => handleToggleSelect(idea.id)}
                        className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900">
                          {idea.title}
                        </h4>
                        <div
                          className="text-xs text-gray-500 mt-1 line-clamp-2"
                          dangerouslySetInnerHTML={{ __html: idea.description }}
                        />
                        <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                          <span>
                            {idea.publishingDateTime
                              ? new Date(idea.publishingDateTime).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })
                              : 'No date'}
                          </span>
                          <span>•</span>
                          <span>{idea.User.name || idea.User.email}</span>
                          <span>•</span>
                          <span className="capitalize">{idea.status.toLowerCase()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {displayedIdeas.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSelectAll(displayedIdeas)}
              >
                Select All ({displayedIdeas.length})
              </Button>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleAssignSelected}
              disabled={selectedIds.size === 0 || assigning}
            >
              {assigning
                ? 'Assigning...'
                : `Assign Selected (${selectedIds.size})`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

