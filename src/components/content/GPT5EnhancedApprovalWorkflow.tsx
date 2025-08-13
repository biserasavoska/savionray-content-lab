'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/common/Card'
import Badge from '@/components/ui/common/Badge'
import Button from '@/components/ui/common/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'

interface GPT5EnhancedApprovalWorkflowProps {
  contentItem?: {
    id: string
    title: string
    description: string
    status: string
    priority: string
    isOverdue: boolean
    isAIGenerated: boolean
    contentType: string
    createdAt: string
    createdBy: string
    deadline: string
    model: string
    verbosity: string
    reasoningEffort: string
  }
}

export function GPT5EnhancedApprovalWorkflow({ contentItem }: GPT5EnhancedApprovalWorkflowProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved' | 'rejected' | 'needs-revision'>('pending')

  // Mock data for the demo
  const mockContentItem = {
    id: 'gpt5-test-001',
    title: 'AI-Powered Marketing Strategy Guide',
    description: 'Comprehensive guide on implementing AI-driven marketing strategies for modern businesses, including practical examples and ROI calculations.',
    status: 'In Review',
    priority: 'HIGH Priority',
    isOverdue: true,
    isAIGenerated: true,
    contentType: 'BLOG_POST',
    createdAt: '1/15/2025',
    createdBy: 'Sarah Marketing',
    deadline: '1/20/2025',
    model: 'gpt-5-mini',
    verbosity: 'medium',
    reasoningEffort: 'high'
  }

  const item = contentItem || mockContentItem

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'In Review': return 'warning'
      case 'Approved': return 'success'
      case 'Rejected': return 'error'
      case 'Needs Revision': return 'info'
      default: return 'default'
    }
  }

  const getPriorityBadgeVariant = (priority: string) => {
    if (priority.includes('HIGH')) return 'error'
    if (priority.includes('MEDIUM')) return 'warning'
    return 'default'
  }

  const handleApproval = (status: 'approved' | 'rejected' | 'needs-revision') => {
    setApprovalStatus(status)
    // Here you would typically make an API call to update the approval status
    console.log(`Content ${status}:`, item.id)
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          GPT-5 Enhanced Approval Workflow Test
        </h1>
        <p className="text-lg text-gray-600">
          Test the new AI-powered content approval workflow with enhanced GPT-5 features.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>GPT-5 Enhanced Content Approval</span>
            <div className="flex items-center space-x-2">
              <Badge variant={getStatusBadgeVariant(item.status)}>
                {item.status}
              </Badge>
              <Badge variant={getPriorityBadgeVariant(item.priority)}>
                {item.priority}
              </Badge>
              {item.isOverdue && (
                <Badge variant="error">Overdue</Badge>
              )}
              {item.isAIGenerated && (
                <Badge variant="info">AI Generated</Badge>
              )}
            </div>
          </CardTitle>
          <p className="text-gray-600">AI-powered content analysis and approval workflow management.</p>
        </CardHeader>
        
        <CardContent>
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
            <p className="text-gray-700 mb-4">{item.description}</p>
            <div className="bg-gray-100 px-3 py-2 rounded-md text-sm text-gray-600">
              Generated with {item.model} (Verbosity: {item.verbosity}, Effort: {item.reasoningEffort}).
            </div>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="ai-analysis">AI Analysis</TabsTrigger>
              <TabsTrigger value="approval">Approval</TabsTrigger>
              <TabsTrigger value="revision">Revision</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Content Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Content Type:</span>
                      <span className="font-medium">{item.contentType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span className="font-medium">{item.createdAt}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created By:</span>
                      <span className="font-medium">{item.createdBy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Deadline:</span>
                      <span className="font-medium">{item.deadline}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">AI Generation Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Model:</span>
                      <span className="font-medium">{item.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Verbosity:</span>
                      <span className="font-medium">{item.verbosity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reasoning Effort:</span>
                      <span className="font-medium">{item.reasoningEffort}</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ai-analysis" className="mt-6">
              <div className="space-y-6">
                <h4 className="text-lg font-medium text-gray-900">AI Quality Assessment</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-100 p-4 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-800">8.5/10</div>
                      <div className="text-sm text-green-600">Readability</div>
                    </div>
                  </div>
                  <div className="bg-blue-100 p-4 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-800">8.2/10</div>
                      <div className="text-sm text-blue-600">Engagement</div>
                    </div>
                  </div>
                  <div className="bg-purple-100 p-4 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-800">9.1/10</div>
                      <div className="text-sm text-purple-600">SEO Score</div>
                    </div>
                  </div>
                  <div className="bg-orange-100 p-4 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-800">8.8/10</div>
                      <div className="text-sm text-orange-600">Brand Alignment</div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="approval" className="mt-6">
              <div className="space-y-6">
                <h4 className="text-lg font-medium text-gray-900">Approval Actions</h4>
                <div className="flex space-x-4">
                  <Button 
                    onClick={() => handleApproval('approved')}
                    variant="success"
                    className="flex-1"
                  >
                    Approve Content
                  </Button>
                  <Button 
                    onClick={() => handleApproval('needs-revision')}
                    variant="secondary"
                    className="flex-1"
                  >
                    Request Revision
                  </Button>
                  <Button 
                    onClick={() => handleApproval('rejected')}
                    variant="danger"
                    className="flex-1"
                  >
                    Reject Content
                  </Button>
                </div>
                
                {approvalStatus !== 'pending' && (
                  <div className={`p-4 rounded-lg ${
                    approvalStatus === 'approved' ? 'bg-green-100 text-green-800' :
                    approvalStatus === 'needs-revision' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    <p className="font-medium">
                      Content {approvalStatus === 'approved' ? 'approved' : 
                              approvalStatus === 'needs-revision' ? 'marked for revision' : 
                              'rejected'} successfully.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="revision" className="mt-6">
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900">Revision Requests</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600">
                    No revision requests at this time. Content is currently under review.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900">Approval History</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600">
                    No approval history available yet. This is a new content item.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
