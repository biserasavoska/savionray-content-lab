'use client'

import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import { isCreative, isClient, isAdmin } from '@/lib/auth'
import ContentWorkflowManager from '@/components/content/ContentWorkflowManager'
import ContentCollaborationPanel from '@/components/content/ContentCollaborationPanel'
import ContentCreationForm from '@/components/content/ContentCreationForm'
import ContentReviewPanel from '@/components/content/ContentReviewPanel'
import ContentApprovalWorkflow from '@/components/content/ContentApprovalWorkflow'
import Button from '@/components/ui/common/Button'
import Badge from '@/components/ui/common/Badge'

export default function TestWorkflowCollaborationPage() {
  const { data: session } = useSession()
  const [activeInterface, setActiveInterface] = useState<'workflow' | 'collaboration' | 'creation' | 'review' | 'approval'>('workflow')
  const [contentStatus, setContentStatus] = useState('DRAFT')
  const [contentType, setContentType] = useState('BLOG_POST')
  const [contentId] = useState('test-content-123')

  // Mock interface context for role-based components
  const interfaceContext = {
    isCreative: isCreative(session),
    isClient: isClient(session),
    isAdmin: isAdmin(session),
    user: session?.user,
  }

  const handleStatusChange = (newStatus: string) => {
    setContentStatus(newStatus)
    console.log('Status changed to:', newStatus)
  }

  const handleWorkflowAction = async (actionId: string, data?: any) => {
    console.log('Workflow action:', actionId, data)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  const handleCommentAdd = async (comment: any) => {
    console.log('Adding comment:', comment)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  const handleFeedbackAdd = async (feedback: any) => {
    console.log('Adding feedback:', feedback)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  const handleVersionCreate = async (version: any) => {
    console.log('Creating version:', version)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  const handleContentCreate = async (contentData: any) => {
    console.log('Creating content:', contentData)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  const handleContentReview = async (reviewData: any) => {
    console.log('Reviewing content:', reviewData)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  const handleContentApproval = async (approvalData: any) => {
    console.log('Approving content:', approvalData)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600">Please sign in to access the workflow and collaboration features.</p>
        </div>
      </div>
    )
  }

  const isCreativeUser = interfaceContext.isCreative
  const isClientUser = interfaceContext.isClient
  const isAdminUser = interfaceContext.isAdmin

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Phase 2B & 2C: Workflow & Collaboration Testing
              </h1>
              <p className="text-sm text-gray-500">
                Testing content workflow management and collaboration features
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">User:</span>
                <Badge variant="primary">{session.user?.name || session.user?.email}</Badge>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Role:</span>
                <Badge variant="success">{session.user?.role || 'client'}</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'workflow', label: 'Workflow Management', roles: ['creative', 'client', 'admin'] },
              { id: 'collaboration', label: 'Collaboration Panel', roles: ['creative', 'client', 'admin'] },
              { id: 'creation', label: 'Content Creation', roles: ['creative', 'admin'] },
              { id: 'review', label: 'Content Review', roles: ['client', 'admin'] },
              { id: 'approval', label: 'Content Approval', roles: ['admin'] },
            ].map(item => {
              const hasAccess = item.roles.includes(session.user?.role || 'client')
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveInterface(item.id as any)}
                  disabled={!hasAccess}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeInterface === item.id
                      ? 'border-blue-500 text-blue-600'
                      : hasAccess
                      ? 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      : 'border-transparent text-gray-300 cursor-not-allowed'
                  }`}
                >
                  {item.label}
                  {!hasAccess && (
                    <Badge variant="default" size="sm" className="ml-2">
                      Restricted
                    </Badge>
                  )}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Interface Display */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  {activeInterface === 'workflow' && 'Content Workflow Management'}
                  {activeInterface === 'collaboration' && 'Content Collaboration Panel'}
                  {activeInterface === 'creation' && 'Content Creation Form'}
                  {activeInterface === 'review' && 'Content Review Panel'}
                  {activeInterface === 'approval' && 'Content Approval Workflow'}
                </h2>
                <p className="text-sm text-gray-500">
                  {activeInterface === 'workflow' && 'Manage content workflow, status transitions, and progress tracking'}
                  {activeInterface === 'collaboration' && 'Collaborate with team members through comments, feedback, and version control'}
                  {activeInterface === 'creation' && 'Create new content with role-based features and templates'}
                  {activeInterface === 'review' && 'Review content and provide feedback as a client'}
                  {activeInterface === 'approval' && 'Approve or reject content as an administrator'}
                </p>
              </div>

              {/* Interface Components */}
              {activeInterface === 'workflow' && (
                <ContentWorkflowManager
                  contentId={contentId}
                  currentStatus={contentStatus}
                  contentType={contentType}
                  onStatusChange={handleStatusChange}
                  onWorkflowAction={handleWorkflowAction}
                />
              )}

              {activeInterface === 'collaboration' && (
                <ContentCollaborationPanel
                  contentId={contentId}
                  contentType={contentType}
                  onCommentAdd={handleCommentAdd}
                  onFeedbackAdd={handleFeedbackAdd}
                  onVersionCreate={handleVersionCreate}
                />
              )}

              {activeInterface === 'creation' && (
                <ContentCreationForm
                  onSubmit={handleContentCreate}
                  onCancel={() => setActiveInterface('workflow')}
                />
              )}

              {activeInterface === 'review' && (
                <ContentReviewPanel
                  content={{
                    id: 'test-content-123',
                    title: 'Sample Blog Post',
                    description: 'This is a sample blog post for testing the review interface.',
                    contentType: 'BLOG_POST',
                    content: 'This is the content of the blog post...',
                    status: 'IN_REVIEW',
                    createdBy: {
                      name: 'Sarah Creative',
                      email: 'sarah@creative.com'
                    },
                    createdAt: new Date('2025-07-07T10:00:00Z'),
                    updatedAt: new Date('2025-07-07T12:00:00Z'),
                    metadata: {
                      targetAudience: 'B2B professionals',
                      keywords: ['content marketing', 'B2B', 'strategy']
                    }
                  }}
                  onSubmitFeedback={handleContentReview}
                  onApprove={() => handleContentReview({ approved: true })}
                  onRequestRevision={() => handleContentReview({ revisionRequested: true })}
                />
              )}

              {activeInterface === 'approval' && (
                <ContentApprovalWorkflow
                  content={{
                    id: 'test-content-123',
                    title: 'Sample Blog Post',
                    description: 'This is a sample blog post for testing the approval workflow.',
                    contentType: 'BLOG_POST',
                    status: 'PENDING_APPROVAL',
                    priority: 'HIGH',
                    createdBy: {
                      id: 'user1',
                      name: 'Sarah Creative',
                      email: 'sarah@creative.com',
                      role: 'creative'
                    },
                    createdAt: new Date('2025-07-07T10:00:00Z'),
                    updatedAt: new Date('2025-07-07T12:00:00Z'),
                    deadline: new Date('2025-07-10T18:00:00Z'),
                    clientFeedback: {
                      rating: 4,
                      feedback: 'Great content, just needs minor adjustments.',
                      suggestions: ['Add more examples', 'Include statistics']
                    },
                    approvalHistory: [
                      {
                        id: '1',
                        action: 'CREATED',
                        performedBy: {
                          id: 'user1',
                          name: 'Sarah Creative',
                          email: 'sarah@creative.com',
                          role: 'creative'
                        },
                        timestamp: new Date('2025-07-07T10:00:00Z')
                      },
                      {
                        id: '2',
                        action: 'SUBMITTED',
                        performedBy: {
                          id: 'user1',
                          name: 'Sarah Creative',
                          email: 'sarah@creative.com',
                          role: 'creative'
                        },
                        timestamp: new Date('2025-07-07T11:00:00Z')
                      }
                    ],
                    metadata: {
                      targetAudience: 'B2B professionals',
                      keywords: ['content marketing', 'B2B', 'strategy'],
                      seoDescription: 'Learn about effective B2B content marketing strategies'
                    }
                  }}
                  onApprove={handleContentApproval}
                  onReject={handleContentApproval}
                  onAssignReviewer={(reviewerId) => console.log('Assign reviewer:', reviewerId)}
                  onUpdatePriority={(priority) => console.log('Update priority:', priority)}
                />
              )}
            </div>
          </div>

          {/* Right Column - Status & Controls */}
          <div className="space-y-6">
            {/* Current Status */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-md font-semibold text-gray-900 mb-4">Current Status</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Content Status
                  </label>
                  <Badge variant="primary" size="lg">
                    {contentStatus.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Content Type
                  </label>
                  <Badge variant="secondary" size="lg">
                    {contentType.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Content ID
                  </label>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {contentId}
                  </code>
                </div>
              </div>
            </div>

            {/* Role Permissions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-md font-semibold text-gray-900 mb-4">Your Permissions</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Content Creation</span>
                  <Badge variant={isCreativeUser || isAdminUser ? 'success' : 'default'} size="sm">
                    {isCreativeUser || isAdminUser ? 'Allowed' : 'Restricted'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Content Review</span>
                  <Badge variant={isClientUser || isAdminUser ? 'success' : 'default'} size="sm">
                    {isClientUser || isAdminUser ? 'Allowed' : 'Restricted'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Content Approval</span>
                  <Badge variant={isAdminUser ? 'success' : 'default'} size="sm">
                    {isAdminUser ? 'Allowed' : 'Restricted'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Workflow Management</span>
                  <Badge variant="success" size="sm">Allowed</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Collaboration</span>
                  <Badge variant="success" size="sm">Allowed</Badge>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-md font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setActiveInterface('workflow')}
                  className="w-full"
                >
                  Manage Workflow
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setActiveInterface('collaboration')}
                  className="w-full"
                >
                  Open Collaboration
                </Button>
                {(isCreativeUser || isAdminUser) && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setActiveInterface('creation')}
                    className="w-full"
                  >
                    Create Content
                  </Button>
                )}
                {(isClientUser || isAdminUser) && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setActiveInterface('review')}
                    className="w-full"
                  >
                    Review Content
                  </Button>
                )}
                {isAdminUser && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setActiveInterface('approval')}
                    className="w-full"
                  >
                    Approve Content
                  </Button>
                )}
              </div>
            </div>

            {/* Test Controls */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-md font-semibold text-gray-900 mb-4">Test Controls</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Change Status
                  </label>
                  <select
                    value={contentStatus}
                    onChange={(e) => setContentStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="IN_REVIEW">In Review</option>
                    <option value="IN_REVISION">In Revision</option>
                    <option value="PENDING_APPROVAL">Pending Approval</option>
                    <option value="PUBLISHED">Published</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Change Type
                  </label>
                  <select
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="BLOG_POST">Blog Post</option>
                    <option value="SOCIAL_MEDIA">Social Media</option>
                    <option value="EMAIL_NEWSLETTER">Email Newsletter</option>
                    <option value="VIDEO_CONTENT">Video Content</option>
                    <option value="INFOGRAPHIC">Infographic</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 