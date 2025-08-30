'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'

import { useInterface } from '@/hooks/useInterface'
import Button from '@/components/ui/common/Button'
import Badge from '@/components/ui/common/Badge'

interface ContentApprovalWorkflowProps {
  content: ApprovalContentData
  onApprove: (approvalData: ApprovalData) => void
  onReject: (rejectionData: RejectionData) => void
  onAssignReviewer: (reviewerId: string) => void
  onUpdatePriority: (priority: string) => void
}

export interface ApprovalContentData {
  id: string
  title: string
  description: string
  contentType: string
  status: 'DRAFT' | 'IN_REVIEW' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'PUBLISHED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  createdBy: {
    id: string
    name: string
    email: string
    role: string
  }
  assignedReviewer?: {
    id: string
    name: string
    email: string
  }
  createdAt: Date
  updatedAt: Date
  deadline?: Date
  clientFeedback?: {
    rating: number
    feedback: string
    suggestions: string[]
  }
  approvalHistory: ApprovalHistoryItem[]
  metadata: {
    targetAudience?: string
    keywords?: string[]
    seoDescription?: string
    estimatedPublishDate?: Date
  }
}

export interface ApprovalHistoryItem {
  id: string
  action: 'CREATED' | 'SUBMITTED' | 'REVIEWED' | 'APPROVED' | 'REJECTED' | 'PUBLISHED'
  performedBy: {
    id: string
    name: string
    email: string
    role: string
  }
  timestamp: Date
  notes?: string
  feedback?: string
}

export interface ApprovalData {
  approved: boolean
  notes: string
  publishDate?: Date
  assignTo?: string
}

export interface RejectionData {
  reason: string
  feedback: string
  revisionRequired: boolean
  reassignTo?: string
}

export default function ContentApprovalWorkflow({
  content,
  onApprove,
  onReject,
  onAssignReviewer,
  onUpdatePriority
}: ContentApprovalWorkflowProps) {
  const { data: session } = useSession()
  const interfaceContext = useInterface()
  const [approvalNotes, setApprovalNotes] = useState('')
  const [publishDate, setPublishDate] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [rejectionFeedback, setRejectionFeedback] = useState('')
  const [showRejectionForm, setShowRejectionForm] = useState(false)
  const [selectedReviewer, setSelectedReviewer] = useState('')

  const isAdminUser = interfaceContext.isAdmin

  const handleApprove = () => {
    const approvalData: ApprovalData = {
      approved: true,
      notes: approvalNotes,
      publishDate: publishDate ? new Date(publishDate) : undefined
    }
    onApprove(approvalData)
  }

  const handleReject = () => {
    const rejectionData: RejectionData = {
      reason: rejectionReason,
      feedback: rejectionFeedback,
      revisionRequired: true
    }
    onReject(rejectionData)
  }

  const handleAssignReviewer = () => {
    if (selectedReviewer) {
      onAssignReviewer(selectedReviewer)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'default'
      case 'IN_REVIEW': return 'secondary'
      case 'PENDING_APPROVAL': return 'secondary'
      case 'APPROVED': return 'default'
      case 'REJECTED': return 'destructive'
      case 'PUBLISHED': return 'default'
      default: return 'default'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'Draft'
      case 'IN_REVIEW': return 'In Review'
      case 'PENDING_APPROVAL': return 'Pending Approval'
      case 'APPROVED': return 'Approved'
      case 'REJECTED': return 'Rejected'
      case 'PUBLISHED': return 'Published'
      default: return status
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'default'
      case 'MEDIUM': return 'default'
      case 'HIGH': return 'secondary'
      case 'URGENT': return 'destructive'
      default: return 'default'
    }
  }

  const isOverdue = content.deadline && new Date() > content.deadline

  if (!isAdminUser) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">
          This approval workflow is only available for admin users.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Content Approval Workflow
            </h2>
            <p className="text-gray-600">
              Manage content approval and publishing workflow
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant={getStatusColor(content.status)}>
              {getStatusText(content.status)}
            </Badge>
            <Badge variant={getPriorityColor(content.priority)}>
              {content.priority} Priority
            </Badge>
            {isOverdue && (
              <Badge variant="destructive">
                Overdue
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Created by:</span>
            <p className="text-gray-600">{content.createdBy.name}</p>
            <p className="text-xs text-gray-500">{content.createdBy.role}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Content Type:</span>
            <p className="text-gray-600">{content.contentType}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Created:</span>
            <p className="text-gray-600">
              {new Date(content.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Deadline:</span>
            <p className={`text-gray-600 ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
              {content.deadline ? new Date(content.deadline).toLocaleDateString() : 'No deadline'}
            </p>
          </div>
        </div>
      </div>

      {/* Content Information */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Information</h3>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-900 mb-2">{content.title}</h4>
          <p className="text-gray-700 mb-3">{content.description}</p>
          
          {content.metadata?.targetAudience && (
            <div className="mb-2">
              <span className="text-sm font-medium text-gray-600">Target Audience:</span>
              <span className="text-sm text-gray-700 ml-2">{content.metadata.targetAudience}</span>
            </div>
          )}

          {content.metadata?.keywords && content.metadata.keywords.length > 0 && (
            <div className="mb-3">
              <span className="text-sm font-medium text-gray-600">Keywords:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {content.metadata.keywords.map((keyword, index) => (
                  <Badge key={index} variant="default" size="sm">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Client Feedback */}
        {content.clientFeedback && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-blue-900 mb-2">Client Feedback</h4>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-blue-700">Rating:</span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`text-lg ${
                      star <= content.clientFeedback!.rating
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
            <p className="text-blue-800 text-sm mb-2">{content.clientFeedback.feedback}</p>
            {content.clientFeedback.suggestions.length > 0 && (
              <div>
                <span className="text-sm font-medium text-blue-700">Suggestions:</span>
                <ul className="list-disc list-inside text-sm text-blue-800 mt-1">
                  {content.clientFeedback.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Approval Actions */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Approval Actions</h3>

        {/* Assign Reviewer */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assign Reviewer
          </label>
          <div className="flex gap-2">
            <select
              value={selectedReviewer}
              onChange={(e) => setSelectedReviewer(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a reviewer...</option>
              <option value="reviewer1">John Doe (Creative)</option>
              <option value="reviewer2">Jane Smith (Editor)</option>
              <option value="reviewer3">Mike Johnson (Senior Creative)</option>
            </select>
            <Button
              type="button"
              variant="secondary"
              onClick={handleAssignReviewer}
              disabled={!selectedReviewer}
            >
              Assign
            </Button>
          </div>
        </div>

        {/* Approval Form */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Approval Notes
          </label>
          <textarea
            value={approvalNotes}
            onChange={(e) => setApprovalNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add any notes about the approval..."
          />
        </div>

        {/* Publish Date */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Publish Date (Optional)
          </label>
          <input
            type="date"
            value={publishDate}
            onChange={(e) => setPublishDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="destructive"
            onClick={() => setShowRejectionForm(true)}
          >
            Reject Content
          </Button>
          <Button
            type="button"
            variant="default"
            onClick={handleApprove}
          >
            Approve Content
          </Button>
        </div>
      </div>

      {/* Rejection Form */}
      {showRejectionForm && (
        <div className="p-6 border-b border-gray-200 bg-red-50">
          <h4 className="font-semibold text-red-900 mb-4">Rejection Details</h4>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-red-700 mb-2">
              Reason for Rejection *
            </label>
            <select
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Select a reason...</option>
              <option value="QUALITY">Quality Issues</option>
              <option value="BRAND_GUIDELINES">Brand Guidelines Violation</option>
              <option value="CONTENT_MISMATCH">Content Doesn't Match Brief</option>
              <option value="TECHNICAL_ISSUES">Technical Issues</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-red-700 mb-2">
              Detailed Feedback *
            </label>
            <textarea
              value={rejectionFeedback}
              onChange={(e) => setRejectionFeedback(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Provide detailed feedback for the content creator..."
              required
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowRejectionForm(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectionReason || !rejectionFeedback}
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      )}

      {/* Approval History */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Approval History</h3>
        
        <div className="space-y-3">
          {content.approvalHistory.map((item, index) => (
            <div key={item.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-blue-600">
                    {item.action.charAt(0)}
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900">{item.performedBy.name}</span>
                  <Badge variant="default" size="sm">{item.performedBy.role}</Badge>
                  <Badge variant={getStatusColor(item.action.toLowerCase())} size="sm">
                    {item.action}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  {new Date(item.timestamp).toLocaleString()}
                </p>
                {item.notes && (
                  <p className="text-sm text-gray-700 mt-1">{item.notes}</p>
                )}
                {item.feedback && (
                  <p className="text-sm text-gray-700 mt-1 italic">"{item.feedback}"</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 