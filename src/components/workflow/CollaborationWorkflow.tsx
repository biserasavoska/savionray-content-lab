'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  Users, 
  MessageCircle, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ArrowRight,
  ExternalLink,
  Bell,
  Settings,
  History,
  Share2
} from 'lucide-react'
import RealTimeCollaboration from '@/components/collaboration/RealTimeCollaboration'

interface WorkflowStep {
  id: string
  name: string
  status: 'pending' | 'in-progress' | 'completed' | 'blocked'
  assignee?: string
  dueDate?: Date
  description: string
}

interface CollaborationWorkflowProps {
  contentId: string
  contentType: 'idea' | 'draft' | 'content'
  workflowType: 'development' | 'review' | 'approval'
  onWorkflowUpdate?: (workflow: any) => void
}

export default function CollaborationWorkflow({
  contentId,
  contentType,
  workflowType,
  onWorkflowUpdate
}: CollaborationWorkflowProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [workflowHistory, setWorkflowHistory] = useState<any[]>([])

  // Initialize workflow steps based on type
  useEffect(() => {
    const steps = getWorkflowSteps(workflowType, contentType)
    setWorkflowSteps(steps)
  }, [workflowType, contentType])

  const getWorkflowSteps = (type: string, content: string): WorkflowStep[] => {
    switch (type) {
      case 'development':
        return [
          {
            id: '1',
            name: 'Idea Development',
            status: 'in-progress',
            description: 'Collaborative idea brainstorming and development',
            assignee: session?.user?.name
          },
          {
            id: '2',
            name: 'Content Creation',
            status: 'pending',
            description: 'Create initial content based on developed ideas'
          },
          {
            id: '3',
            name: 'Internal Review',
            status: 'pending',
            description: 'Team review and feedback collection'
          },
          {
            id: '4',
            name: 'Client Review',
            status: 'pending',
            description: 'Client feedback and approval'
          },
          {
            id: '5',
            name: 'Final Approval',
            status: 'pending',
            description: 'Final approval and publishing'
          }
        ]
      
      case 'review':
        return [
          {
            id: '1',
            name: 'Content Review',
            status: 'in-progress',
            description: 'Collaborative content review and editing',
            assignee: session?.user?.name
          },
          {
            id: '2',
            name: 'Feedback Integration',
            status: 'pending',
            description: 'Integrate feedback and make revisions'
          },
          {
            id: '3',
            name: 'Quality Check',
            status: 'pending',
            description: 'Final quality assurance check'
          },
          {
            id: '4',
            name: 'Approval',
            status: 'pending',
            description: 'Manager approval for publishing'
          }
        ]
      
      case 'approval':
        return [
          {
            id: '1',
            name: 'Content Submission',
            status: 'completed',
            description: 'Content submitted for approval'
          },
          {
            id: '2',
            name: 'Review Process',
            status: 'in-progress',
            description: 'Collaborative review and approval process',
            assignee: session?.user?.name
          },
          {
            id: '3',
            name: 'Client Approval',
            status: 'pending',
            description: 'Client review and approval'
          },
          {
            id: '4',
            name: 'Publishing',
            status: 'pending',
            description: 'Final publishing and distribution'
          }
        ]
      
      default:
        return []
    }
  }

  const updateStepStatus = (stepId: string, status: WorkflowStep['status']) => {
    setWorkflowSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status } : step
    ))
    
    // Add to workflow history
    const historyEntry = {
      id: Date.now().toString(),
      stepId,
      status,
      timestamp: new Date(),
      user: session?.user?.name,
      action: `Updated step "${workflowSteps.find(s => s.id === stepId)?.name}" to ${status}`
    }
    setWorkflowHistory(prev => [historyEntry, ...prev])
    
    // Trigger notification
    addNotification({
      id: Date.now().toString(),
      type: 'workflow',
      title: 'Workflow Updated',
      message: `Step "${workflowSteps.find(s => s.id === stepId)?.name}" marked as ${status}`,
      timestamp: new Date()
    })
    
    onWorkflowUpdate?.({ steps: workflowSteps, currentStep, history: workflowHistory })
  }

  const addNotification = (notification: any) => {
    setNotifications(prev => [notification, ...prev])
  }

  const getStepIcon = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={20} className="text-green-500" />
      case 'in-progress':
        return <Clock size={20} className="text-blue-500" />
      case 'blocked':
        return <AlertCircle size={20} className="text-red-500" />
      default:
        return <Clock size={20} className="text-gray-400" />
    }
  }

  const getStepColor = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed':
        return 'border-green-200 bg-green-50'
      case 'in-progress':
        return 'border-blue-200 bg-blue-50'
      case 'blocked':
        return 'border-red-200 bg-red-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  return (
    <div className="flex h-full bg-white rounded-lg shadow-sm border">
      {/* Workflow Sidebar */}
      <div className="w-80 border-r bg-gray-50">
        {/* Workflow Header */}
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {workflowType === 'development' ? 'Development Workflow' :
             workflowType === 'review' ? 'Review Workflow' : 'Approval Workflow'}
          </h3>
          <p className="text-sm text-gray-600">
            {contentType === 'idea' ? 'Idea Development' :
             contentType === 'draft' ? 'Content Draft' : 'Content Review'}
          </p>
        </div>

        {/* Workflow Steps */}
        <div className="p-4">
          <h4 className="font-medium text-gray-900 mb-3">Workflow Steps</h4>
          <div className="space-y-3">
            {workflowSteps.map((step, index) => (
              <div
                key={step.id}
                className={`p-3 rounded-lg border ${getStepColor(step.status)} cursor-pointer hover:shadow-sm transition-shadow`}
                onClick={() => setCurrentStep(index)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getStepIcon(step.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-medium text-gray-900">
                        {step.name}
                      </h5>
                      <p className="text-xs text-gray-600 mt-1">
                        {step.description}
                      </p>
                      {step.assignee && (
                        <p className="text-xs text-blue-600 mt-1">
                          Assigned to: {step.assignee}
                        </p>
                      )}
                    </div>
                  </div>
                  {currentStep === index && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
                
                {/* Step Actions */}
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        updateStepStatus(step.id, 'completed')
                      }}
                      className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                    >
                      Complete
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        updateStepStatus(step.id, 'blocked')
                      }}
                      className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      Block
                    </button>
                  </div>
                  <span className="text-xs text-gray-500">
                    Step {index + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-t">
          <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
          <div className="space-y-2">
            <button
              onClick={() => router.push(`/ideas/${contentId}`)}
              className="w-full flex items-center space-x-2 p-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
            >
              <FileText size={16} />
              <span>View Original</span>
              <ExternalLink size={14} />
            </button>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-full flex items-center space-x-2 p-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
            >
              <Bell size={16} />
              <span>Notifications</span>
              {notifications.length > 0 && (
                <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {notifications.length}
                </span>
              )}
            </button>
            <button
              onClick={() => router.push(`/content-review/${contentId}`)}
              className="w-full flex items-center space-x-2 p-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
            >
              <MessageCircle size={16} />
              <span>Review History</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Collaboration Area */}
      <div className="flex-1 flex flex-col">
        {/* Collaboration Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {workflowSteps[currentStep]?.name || 'Collaboration'}
            </h2>
            <p className="text-sm text-gray-600">
              {workflowSteps[currentStep]?.description || 'Real-time collaboration workspace'}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => updateStepStatus(workflowSteps[currentStep]?.id || '', 'completed')}
              className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
            >
              <CheckCircle size={14} />
              <span>Complete Step</span>
            </button>
            <button
              onClick={() => router.push(`/delivery-plans`)}
              className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
            >
              <ArrowRight size={14} />
              <span>Next Step</span>
            </button>
          </div>
        </div>

        {/* Real-time Collaboration */}
        <div className="flex-1">
          <RealTimeCollaboration
            contentId={contentId}
            contentType={contentType}
            initialContent={`# ${workflowSteps[currentStep]?.name || 'Collaboration'}\n\nThis is a collaborative workspace for ${workflowSteps[currentStep]?.description?.toLowerCase() || 'real-time collaboration'}.\n\n## Current Status\n- **Step**: ${workflowSteps[currentStep]?.name || 'Unknown'}\n- **Status**: ${workflowSteps[currentStep]?.status || 'pending'}\n- **Assignee**: ${workflowSteps[currentStep]?.assignee || 'Unassigned'}\n\n## Instructions\n1. Collaborate with your team in real-time\n2. Use the rich text editor for formatting\n3. Add comments for feedback\n4. Complete the step when finished\n\n## Workflow Context\n- **Type**: ${workflowType}\n- **Content**: ${contentType}\n- **ID**: ${contentId}\n\nStart collaborating below! 🚀`}
            onContentChange={(content) => {
              console.log('Content updated in workflow:', content.substring(0, 100) + '...')
            }}
          />
        </div>
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="w-80 border-l bg-gray-50">
          <div className="p-4 border-b">
            <h4 className="font-medium text-gray-900 mb-3">Notifications</h4>
          </div>
          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-500">No notifications</p>
            ) : (
              notifications.map(notification => (
                <div key={notification.id} className="p-3 bg-white rounded-lg border">
                  <div className="flex items-start space-x-2">
                    <Bell size={16} className="text-blue-500 mt-0.5" />
                    <div className="flex-1">
                      <h5 className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </h5>
                      <p className="text-xs text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {notification.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
} 