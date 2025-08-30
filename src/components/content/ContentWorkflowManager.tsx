'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

import { isCreative, isClient, isAdmin } from '@/lib/auth'
import Button from '@/components/ui/common/Button'
import Badge from '@/components/ui/common/Badge'
import { DRAFT_STATUS, CONTENT_TYPE } from '@/lib/utils/enum-constants'

interface ContentWorkflowManagerProps {
  contentId: string
  currentStatus: string
  contentType: string
  onStatusChange: (newStatus: string) => void
  onWorkflowAction: (action: string, data?: any) => void
}

interface WorkflowStep {
  id: string
  name: string
  status: string
  completed: boolean
  required: boolean
  assignee?: string
  dueDate?: Date
  completedAt?: Date
}

interface WorkflowAction {
  id: string
  name: string
  description: string
  allowedRoles: string[]
  nextStatus: string
  requiresApproval: boolean
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  { id: 'draft', name: 'Draft Creation', status: 'DRAFT', completed: false, required: true },
  { id: 'review', name: 'Client Review', status: 'IN_REVIEW', completed: false, required: true },
  { id: 'revision', name: 'Revisions', status: 'IN_REVISION', completed: false, required: false },
  { id: 'approval', name: 'Final Approval', status: 'PENDING_APPROVAL', completed: false, required: true },
  { id: 'published', name: 'Published', status: 'PUBLISHED', completed: false, required: true },
]

const WORKFLOW_ACTIONS: WorkflowAction[] = [
  {
    id: 'submit_for_review',
    name: 'Submit for Review',
    description: 'Submit content to client for review',
    allowedRoles: ['creative', 'admin'],
    nextStatus: 'IN_REVIEW',
    requiresApproval: false,
  },
  {
    id: 'request_revision',
    name: 'Request Revision',
    description: 'Request changes from creative team',
    allowedRoles: ['client', 'admin'],
    nextStatus: 'IN_REVISION',
    requiresApproval: false,
  },
  {
    id: 'approve_content',
    name: 'Approve Content',
    description: 'Approve content for publishing',
    allowedRoles: ['client', 'admin'],
    nextStatus: 'PENDING_APPROVAL',
    requiresApproval: false,
  },
  {
    id: 'publish_content',
    name: 'Publish Content',
    description: 'Publish content to live platform',
    allowedRoles: ['admin'],
    nextStatus: 'PUBLISHED',
    requiresApproval: true,
  },
  {
    id: 'reject_content',
    name: 'Reject Content',
    description: 'Reject content and return to draft',
    allowedRoles: ['client', 'admin'],
    nextStatus: 'DRAFT',
    requiresApproval: false,
  },
]

export default function ContentWorkflowManager({
  contentId,
  currentStatus,
  contentType,
  onStatusChange,
  onWorkflowAction,
}: ContentWorkflowManagerProps) {
  const { data: session } = useSession()
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>(WORKFLOW_STEPS)
  const [availableActions, setAvailableActions] = useState<WorkflowAction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedAction, setSelectedAction] = useState<string>('')
  const [actionComment, setActionComment] = useState('')

  useEffect(() => {
    updateWorkflowProgress()
    updateAvailableActions()
  }, [currentStatus, session])

  const updateWorkflowProgress = () => {
    const updatedSteps = workflowSteps.map(step => ({
      ...step,
      completed: isStepCompleted(step.status),
    }))
    setWorkflowSteps(updatedSteps)
  }

  const isStepCompleted = (stepStatus: string): boolean => {
    const statusOrder = ['DRAFT', 'IN_REVIEW', 'IN_REVISION', 'PENDING_APPROVAL', 'PUBLISHED']
    const currentIndex = statusOrder.indexOf(currentStatus)
    const stepIndex = statusOrder.indexOf(stepStatus)
    return stepIndex <= currentIndex
  }

  const updateAvailableActions = () => {
    if (!session) return

    const userRole = session.user?.role || 'client'
    const actions = WORKFLOW_ACTIONS.filter(action => 
      action.allowedRoles.includes(userRole) && 
      canPerformAction(action, currentStatus)
    )
    setAvailableActions(actions)
  }

  const canPerformAction = (action: WorkflowAction, currentStatus: string): boolean => {
    const validTransitions: Record<string, string[]> = {
      'DRAFT': ['submit_for_review'],
      'IN_REVIEW': ['request_revision', 'approve_content', 'reject_content'],
      'IN_REVISION': ['submit_for_review'],
      'PENDING_APPROVAL': ['publish_content', 'reject_content'],
      'PUBLISHED': [],
    }
    
    return validTransitions[currentStatus]?.includes(action.id) || false
  }

  const handleAction = async (actionId: string) => {
    setIsLoading(true)
    try {
      const action = WORKFLOW_ACTIONS.find(a => a.id === actionId)
      if (!action) return

      const actionData = {
        actionId,
        contentId,
        newStatus: action.nextStatus,
        comment: actionComment,
        performedBy: session?.user?.id,
        timestamp: new Date().toISOString(),
      }

      await onWorkflowAction(actionId, actionData)
      onStatusChange(action.nextStatus)
      
      setActionComment('')
      setSelectedAction('')
    } catch (error) {
      console.error('Workflow action failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'default'
      case 'IN_REVIEW': return 'secondary'
      case 'IN_REVISION': return 'secondary'
      case 'PENDING_APPROVAL': return 'default'
      case 'PUBLISHED': return 'default'
      default: return 'default'
    }
  }

  const getProgressPercentage = () => {
    const completedSteps = workflowSteps.filter(step => step.completed).length
    return Math.round((completedSteps / workflowSteps.length) * 100)
  }

  if (!session) {
    return <div className="p-4 text-center text-gray-500">Please sign in to manage workflow</div>
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Content Workflow</h3>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Badge variant={getStatusColor(currentStatus)} size="lg">
              {currentStatus.replace('_', ' ')}
            </Badge>
            <span className="text-sm text-gray-500">
              {contentType.replace('_', ' ')}
            </span>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">{getProgressPercentage()}% Complete</div>
            <div className="w-24 h-2 bg-gray-200 rounded-full mt-1">
              <div 
                className="h-2 bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Steps */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-900 mb-3">Workflow Steps</h4>
        <div className="space-y-3">
          {workflowSteps.map((step, index) => (
            <div key={step.id} className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step.completed 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {step.completed ? '✓' : index + 1}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">{step.name}</div>
                <div className="text-xs text-gray-500">
                  {step.completed ? 'Completed' : 'Pending'}
                </div>
              </div>
              <Badge 
                variant={step.completed ? 'default' : 'secondary'} 
                size="sm"
              >
                {step.status.replace('_', ' ')}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Available Actions */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-900 mb-3">Available Actions</h4>
        {availableActions.length === 0 ? (
          <div className="text-sm text-gray-500 italic">No actions available for current status</div>
        ) : (
          <div className="space-y-3">
            {availableActions.map(action => (
              <div key={action.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h5 className="text-sm font-medium text-gray-900">{action.name}</h5>
                    <p className="text-xs text-gray-500 mt-1">{action.description}</p>
                    {action.requiresApproval && (
                      <Badge variant="secondary" size="sm" className="mt-2">
                        Requires Approval
                      </Badge>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => setSelectedAction(selectedAction === action.id ? '' : action.id)}
                    disabled={isLoading}
                  >
                    {selectedAction === action.id ? 'Cancel' : 'Select'}
                  </Button>
                </div>
                
                {selectedAction === action.id && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <textarea
                      placeholder="Add a comment (optional)..."
                      value={actionComment}
                      onChange={(e) => setActionComment(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                    <div className="mt-3 flex space-x-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleAction(action.id)}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Processing...' : `Confirm ${action.name}`}
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setSelectedAction('')
                          setActionComment('')
                        }}
                        disabled={isLoading}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Workflow History */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-3">Recent Activity</h4>
        <div className="space-y-2">
          <div className="text-sm text-gray-500 italic">Workflow history will be displayed here</div>
        </div>
      </div>
    </div>
  )
} 