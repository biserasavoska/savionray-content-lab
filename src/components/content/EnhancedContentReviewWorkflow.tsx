'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  MessageSquare, 
  Edit3, 
  Eye,
  Calendar,
  Users,
  FileText,
  AlertCircle
} from 'lucide-react'

interface ContentDraft {
  id: string
  status: string
  body: string
  metadata: any
  createdAt: string
  updatedAt: string
  createdBy: {
    id: string
    name: string
    email: string
  }
  idea: {
    id: string
    title: string
    description: string
    status: string
  }
  feedbacks: Array<{
    id: string
    comment: string
    createdAt: string
    createdBy: {
      id: string
      name: string
      email: string
    }
  }>
}

interface EnhancedContentReviewWorkflowProps {
  contentDrafts: ContentDraft[]
  onStatusChange: (draftId: string, newStatus: string) => void
  onAddFeedback: (draftId: string, comment: string) => void
  onEditDraft: (draftId: string) => void
}

const statusConfig = {
  DRAFT: { 
    label: 'Draft', 
    color: 'bg-gray-100 text-gray-800',
    icon: FileText,
    description: 'Initial draft created'
  },
  AWAITING_FEEDBACK: { 
    label: 'Awaiting Feedback', 
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
    description: 'Waiting for client feedback'
  },
  AWAITING_REVISION: { 
    label: 'Awaiting Revision', 
    color: 'bg-orange-100 text-orange-800',
    icon: Edit3,
    description: 'Revisions requested'
  },
  APPROVED: { 
    label: 'Approved', 
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
    description: 'Content approved by client'
  },
  REJECTED: { 
    label: 'Rejected', 
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
    description: 'Content rejected'
  },
  PUBLISHED: { 
    label: 'Published', 
    color: 'bg-blue-100 text-blue-800',
    icon: Eye,
    description: 'Content published'
  }
}

export default function EnhancedContentReviewWorkflow({
  contentDrafts,
  onStatusChange,
  onAddFeedback,
  onEditDraft
}: EnhancedContentReviewWorkflowProps) {
  const { data: session } = useSession()
  const [selectedDraft, setSelectedDraft] = useState<ContentDraft | null>(null)
  const [newFeedback, setNewFeedback] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'updatedAt' | 'createdAt' | 'status'>('updatedAt')

  const filteredDrafts = contentDrafts
    .filter(draft => filterStatus === 'all' || draft.status === filterStatus)
    .sort((a, b) => {
      switch (sortBy) {
        case 'updatedAt':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'status':
          return a.status.localeCompare(b.status)
        default:
          return 0
      }
    })

  const handleStatusChange = (draftId: string, newStatus: string) => {
    onStatusChange(draftId, newStatus)
    if (selectedDraft?.id === draftId) {
      setSelectedDraft(prev => prev ? { ...prev, status: newStatus } : null)
    }
  }

  const handleAddFeedback = () => {
    if (selectedDraft && newFeedback.trim()) {
      onAddFeedback(selectedDraft.id, newFeedback.trim())
      setNewFeedback('')
    }
  }

  const getStatusIcon = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig]
    return config ? React.createElement(config.icon, { className: 'w-4 h-4' }) : null
  }

  const getStatusColor = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig]
    return config?.color || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig]
    return config?.label || status
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Content Review Workflow</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-600">
                {session?.user?.name || 'User'}
              </span>
            </div>
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {Object.entries(statusConfig).map(([status, config]) => {
            const count = contentDrafts.filter(draft => draft.status === status).length
            return (
              <div key={status} className="text-center">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
                  {React.createElement(config.icon, { className: 'w-4 h-4 mr-1' })}
                  {config.label}
                </div>
                <div className="text-2xl font-bold text-gray-900 mt-1">{count}</div>
                <div className="text-xs text-gray-500">{config.description}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              {Object.entries(statusConfig).map(([status, config]) => (
                <option key={status} value={status}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="updatedAt">Last Updated</option>
              <option value="createdAt">Created Date</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content List and Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              Content Items ({filteredDrafts.length})
            </h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {filteredDrafts.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No content items found</p>
              </div>
            ) : (
              filteredDrafts.map((draft) => (
                <div
                  key={draft.id}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedDraft?.id === draft.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => setSelectedDraft(draft)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">
                        {draft.idea.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {draft.body.substring(0, 100)}...
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>By {draft.createdBy.name}</span>
                        <span>{new Date(draft.updatedAt).toLocaleDateString()}</span>
                        <span>{draft.feedbacks.length} feedback</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(draft.status)}`}>
                        {getStatusIcon(draft.status)}
                        <span className="ml-1">{getStatusLabel(draft.status)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Detail View */}
        <div className="bg-white rounded-lg shadow-sm border">
          {selectedDraft ? (
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {selectedDraft.idea.title}
                  </h3>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedDraft.status)}`}>
                    {getStatusIcon(selectedDraft.status)}
                    <span className="ml-1">{getStatusLabel(selectedDraft.status)}</span>
                  </div>
                </div>
                <button
                  onClick={() => onEditDraft(selectedDraft.id)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Edit3 className="w-4 h-4 mr-1" />
                  Edit
                </button>
              </div>

              {/* Content Preview */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-2">Content Preview</h4>
                <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {selectedDraft.body}
                  </p>
                </div>
              </div>

              {/* Status Actions */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-2">Status Actions</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(statusConfig).map(([status, config]) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(selectedDraft.id, status)}
                      disabled={selectedDraft.status === status}
                      className={`flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        selectedDraft.status === status
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {React.createElement(config.icon, { className: 'w-4 h-4 mr-1' })}
                      {config.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback Section */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Feedback</h4>
                
                {/* Add Feedback */}
                <div className="mb-4">
                  <textarea
                    value={newFeedback}
                    onChange={(e) => setNewFeedback(e.target.value)}
                    placeholder="Add your feedback..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                  <button
                    onClick={handleAddFeedback}
                    disabled={!newFeedback.trim()}
                    className="mt-2 inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <MessageSquare className="w-4 h-4 mr-1" />
                    Add Feedback
                  </button>
                </div>

                {/* Feedback List */}
                <div className="space-y-3 max-h-40 overflow-y-auto">
                  {selectedDraft.feedbacks.length === 0 ? (
                    <p className="text-sm text-gray-500">No feedback yet</p>
                  ) : (
                    selectedDraft.feedbacks.map((feedback) => (
                      <div key={feedback.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-start justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {feedback.createdBy.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(feedback.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{feedback.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Select a content item to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 