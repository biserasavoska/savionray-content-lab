'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'

import { useInterface } from '@/hooks/useInterface'
import ContentCreationForm, { ContentFormData } from '@/components/content/ContentCreationForm'
import ContentReviewPanel, { ContentReviewData, ContentFeedback } from '@/components/content/ContentReviewPanel'
import ContentApprovalWorkflow, { ApprovalContentData, ApprovalData, RejectionData } from '@/components/content/ContentApprovalWorkflow'
import Button from '@/components/ui/common/Button'
import Badge from '@/components/ui/common/Badge'

export default function TestContentManagementPage() {
  const { data: session, status } = useSession()
  const interfaceContext = useInterface()
  const [currentView, setCurrentView] = useState<'creation' | 'review' | 'approval'>('creation')
  const [submittedContent, setSubmittedContent] = useState<ContentFormData | null>(null)
  const [feedback, setFeedback] = useState<ContentFeedback | null>(null)

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-gray-600">You need to be signed in to test content management interfaces.</p>
        </div>
      </div>
    )
  }

  const isCreativeUser = interfaceContext.isCreative
  const isClientUser = interfaceContext.isClient
  const isAdminUser = interfaceContext.isAdmin

  const handleContentSubmit = (data: ContentFormData) => {
    setSubmittedContent(data)
    setCurrentView('review')
  }

  const handleFeedbackSubmit = (feedbackData: ContentFeedback) => {
    setFeedback(feedbackData)
    setCurrentView('approval')
  }

  const handleApprove = () => {
    alert('Content approved! This would trigger the publishing workflow.')
  }

  const handleRequestRevision = () => {
    alert('Revision requested! This would notify the content creator.')
  }

  const handleAdminApprove = (approvalData: ApprovalData) => {
    alert(`Content approved with notes: ${approvalData.notes}`)
  }

  const handleAdminReject = (rejectionData: RejectionData) => {
    alert(`Content rejected. Reason: ${rejectionData.reason}`)
  }

  const handleAssignReviewer = (reviewerId: string) => {
    alert(`Reviewer assigned: ${reviewerId}`)
  }

  const handleUpdatePriority = (priority: string) => {
    alert(`Priority updated to: ${priority}`)
  }

  // Mock data for testing
  const mockReviewContent: ContentReviewData = {
    id: '1',
    title: 'Sample Blog Post',
    description: 'A comprehensive guide to content marketing strategies',
    contentType: 'BLOG_POST',
    content: `
      <h2>Introduction</h2>
      <p>Content marketing has become an essential strategy for businesses looking to establish their authority and connect with their audience.</p>
      
      <h2>Key Strategies</h2>
      <ul>
        <li>Create valuable, relevant content</li>
        <li>Optimize for search engines</li>
        <li>Promote across multiple channels</li>
        <li>Measure and analyze performance</li>
      </ul>
      
      <h2>Conclusion</h2>
      <p>By implementing these strategies, businesses can build stronger relationships with their customers and drive sustainable growth.</p>
    `,
    status: 'IN_REVIEW',
    createdBy: {
      name: 'John Doe',
      email: 'john@example.com'
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-16'),
    metadata: {
      targetAudience: 'B2B Marketing Professionals',
      keywords: ['content marketing', 'SEO', 'digital marketing', 'strategy']
    }
  }

  const mockApprovalContent: ApprovalContentData = {
    id: '1',
    title: 'Sample Blog Post',
    description: 'A comprehensive guide to content marketing strategies',
    contentType: 'BLOG_POST',
    status: 'PENDING_APPROVAL',
    priority: 'HIGH',
    createdBy: {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Creative'
    },
    assignedReviewer: {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com'
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-16'),
    deadline: new Date('2024-01-20'),
    clientFeedback: {
      rating: 4,
      feedback: 'Great content overall, but could use more specific examples.',
      suggestions: ['Add case studies', 'Include more statistics', 'Expand the conclusion']
    },
    approvalHistory: [
      {
        id: '1',
        action: 'CREATED',
        performedBy: {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'Creative'
        },
        timestamp: new Date('2024-01-15'),
        notes: 'Initial draft created'
      },
      {
        id: '2',
        action: 'REVIEWED',
        performedBy: {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'Editor'
        },
        timestamp: new Date('2024-01-16'),
        notes: 'Content reviewed and approved for client review'
      }
    ],
    metadata: {
      targetAudience: 'B2B Marketing Professionals',
      keywords: ['content marketing', 'SEO', 'digital marketing', 'strategy'],
      estimatedPublishDate: new Date('2024-01-25')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Phase 2: Content Management Interfaces Test
          </h1>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">User Role:</span>
              <Badge variant={isCreativeUser ? 'primary' : isClientUser ? 'success' : 'secondary'}>
                {isCreativeUser ? 'Creative' : isClientUser ? 'Client' : 'Admin'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">User:</span>
              <span className="text-sm text-gray-600">{session.user?.email}</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={currentView === 'creation' ? 'primary' : 'secondary'}
              onClick={() => setCurrentView('creation')}
            >
              Content Creation
            </Button>
            <Button
              variant={currentView === 'review' ? 'primary' : 'secondary'}
              onClick={() => setCurrentView('review')}
              disabled={!isClientUser}
            >
              Content Review
            </Button>
            <Button
              variant={currentView === 'approval' ? 'primary' : 'secondary'}
              onClick={() => setCurrentView('approval')}
              disabled={!isAdminUser}
            >
              Approval Workflow
            </Button>
          </div>
        </div>

        {/* Content Creation Interface */}
        {currentView === 'creation' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Content Creation Interface
              </h2>
              <p className="text-gray-600">
                {isCreativeUser && 'Create new content with advanced features and AI assistance.'}
                {isClientUser && 'Submit content requests with your requirements and feedback.'}
                {isAdminUser && 'Create content requests and manage the content pipeline.'}
              </p>
            </div>
            <ContentCreationForm
              onSubmit={handleContentSubmit}
              onCancel={() => setCurrentView('creation')}
            />
          </div>
        )}

        {/* Content Review Interface */}
        {currentView === 'review' && isClientUser && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Content Review Interface
              </h2>
              <p className="text-gray-600">
                Review content and provide feedback to the creative team.
              </p>
            </div>
            <ContentReviewPanel
              content={mockReviewContent}
              onSubmitFeedback={handleFeedbackSubmit}
              onApprove={handleApprove}
              onRequestRevision={handleRequestRevision}
            />
          </div>
        )}

        {/* Content Approval Workflow */}
        {currentView === 'approval' && isAdminUser && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Content Approval Workflow
              </h2>
              <p className="text-gray-600">
                Manage content approval, assign reviewers, and control the publishing process.
              </p>
            </div>
            <ContentApprovalWorkflow
              content={mockApprovalContent}
              onApprove={handleAdminApprove}
              onReject={handleAdminReject}
              onAssignReviewer={handleAssignReviewer}
              onUpdatePriority={handleUpdatePriority}
            />
          </div>
        )}

        {/* Role Restrictions */}
        {currentView === 'review' && !isClientUser && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              Access Restricted
            </h3>
            <p className="text-yellow-700">
              The Content Review interface is only available for client users. 
              Please switch to a client account to test this feature.
            </p>
          </div>
        )}

        {currentView === 'approval' && !isAdminUser && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Access Restricted
            </h3>
            <p className="text-red-700">
              The Content Approval Workflow is only available for admin users. 
              Please switch to an admin account to test this feature.
            </p>
          </div>
        )}

        {/* Test Results */}
        {(submittedContent || feedback) && (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Results</h3>
            
            {submittedContent && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Submitted Content:</h4>
                <pre className="bg-gray-50 p-3 rounded text-sm overflow-auto">
                  {JSON.stringify(submittedContent, null, 2)}
                </pre>
              </div>
            )}

            {feedback && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Client Feedback:</h4>
                <pre className="bg-gray-50 p-3 rounded text-sm overflow-auto">
                  {JSON.stringify(feedback, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Testing Instructions</h3>
          <div className="text-blue-800 space-y-2">
            <p><strong>1. Content Creation:</strong> Fill out the form and submit to see the role-based features.</p>
            <p><strong>2. Content Review:</strong> Available for client users - review content and provide feedback.</p>
            <p><strong>3. Approval Workflow:</strong> Available for admin users - manage approvals and assignments.</p>
            <p><strong>Note:</strong> Each interface adapts to the user's role and shows only relevant features.</p>
          </div>
        </div>
      </div>
    </div>
  )
} 