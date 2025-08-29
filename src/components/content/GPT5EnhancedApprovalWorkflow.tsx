'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader } from '@/components/ui/common/Card'
import Badge from '@/components/ui/common/Badge'
import Button from '@/components/ui/common/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/common/Tabs'

interface ContentItem {
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

interface AIAnalysisResult {
  qualityScore: number
  readabilityScore: number
  engagementScore: number
  seoScore: number
  brandAlignmentScore: number
  insights: string[]
  recommendations: string[]
  sentiment: string
  topics: string[]
  approvalRecommendation: 'approve' | 'reject' | 'revision'
  reasoning: string
  confidence: number
}

export function GPT5EnhancedApprovalWorkflow({ contentItem }: { contentItem?: ContentItem }) {
  const { data: session } = useSession()
  const [selectedModel, setSelectedModel] = useState('gpt-5-mini')
  const [verbosity, setVerbosity] = useState('medium')
  const [reasoningEffort, setReasoningEffort] = useState('medium')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null)
  const [approvalDecision, setApprovalDecision] = useState<string>('')
  const [revisionNotes, setRevisionNotes] = useState('')
  const [workflowHistory, setWorkflowHistory] = useState<any[]>([])

  // Mock content item for testing
  const mockContentItem: ContentItem = {
    id: 'test-001',
    title: 'AI-Powered Marketing Strategy Guide',
    description: 'Comprehensive guide for implementing AI-driven marketing strategies in 2025',
    status: 'In Review',
    priority: 'HIGH',
    isOverdue: true,
    isAIGenerated: true,
    contentType: 'Blog Post',
    createdAt: '2025-08-13T10:00:00Z',
    createdBy: 'AI Content Team',
    deadline: '2025-08-15T18:00:00Z',
    model: 'gpt-5-mini',
    verbosity: 'medium',
    reasoningEffort: 'high'
  }

  const currentItem = contentItem || mockContentItem

  // AI-powered content analysis using GPT-5
  const analyzeContentWithAI = async () => {
    if (!session?.user) return

    setIsAnalyzing(true)
    setAiAnalysis(null)

    try {
      // Call the GPT-5 API for content analysis
      const response = await fetch('/api/ai/content-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: currentItem.description,
          title: currentItem.title,
          contentType: currentItem.contentType,
          model: selectedModel,
          verbosity: verbosity,
          reasoningEffort: reasoningEffort,
          analysisType: 'approval-workflow'
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setAiAnalysis(data.analysis)
        // Add to workflow history
        setWorkflowHistory(prev => [...prev, {
          timestamp: new Date().toISOString(),
          action: 'AI Analysis Completed',
          details: `Quality Score: ${data.analysis.qualityScore}/100`,
          model: selectedModel
        }])
      } else {
        console.error('AI analysis failed:', data.error)
      }
    } catch (error) {
      console.error('AI analysis failed:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // AI-powered approval decision
  const makeAIApprovalDecision = async () => {
    if (!aiAnalysis) return

    try {
      // Use GPT-5 to make the final approval decision
      const response = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Content Approval Decision',
          description: `Analyze this content for approval: ${currentItem.title}\n\nAI Analysis Results:\nQuality: ${aiAnalysis.qualityScore}/100\nInsights: ${aiAnalysis.insights.join(', ')}\nRecommendations: ${aiAnalysis.recommendations.join(', ')}\n\nMake a final approval decision with reasoning.`,
          format: 'approval-decision',
          model: selectedModel,
          verbosity: 'high',
          reasoningEffort: 'high',
          maxOutputTokens: 500
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setApprovalDecision(data.postText)
        setWorkflowHistory(prev => [...prev, {
          timestamp: new Date().toISOString(),
          action: 'AI Approval Decision',
          details: data.postText.substring(0, 100) + '...',
          model: selectedModel
        }])
      }
    } catch (error) {
      console.error('AI approval decision failed:', error)
    }
  }

  // Handle approval actions
  const handleApproval = async (action: 'approve' | 'reject' | 'revision') => {
    const actionDetails = {
      approve: 'Content approved by AI workflow',
      reject: 'Content rejected by AI workflow',
      revision: 'Content sent for revision by AI workflow'
    }

    setWorkflowHistory(prev => [...prev, {
      timestamp: new Date().toISOString(),
      action: `Manual ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      details: actionDetails[action],
      model: 'Human + AI'
    }])

    // Here you would integrate with your actual approval system
    console.log(`${action} action taken for content:`, currentItem.id)
  }

  // Generate revision suggestions using GPT-5
  const generateRevisionSuggestions = async () => {
    if (!aiAnalysis) return

    try {
      const response = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Content Revision Suggestions',
          description: `Generate specific revision suggestions for: ${currentItem.title}\n\nCurrent Issues:\n${aiAnalysis.insights.join('\n')}\n\nRecommendations:\n${aiAnalysis.recommendations.join('\n')}\n\nProvide actionable revision steps.`,
          format: 'revision-guide',
          model: selectedModel,
          verbosity: 'high',
          reasoningEffort: 'high',
          maxOutputTokens: 800
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setRevisionNotes(data.postText)
        setWorkflowHistory(prev => [...prev, {
          timestamp: new Date().toISOString(),
          action: 'AI Revision Suggestions Generated',
          details: 'Detailed revision guide created',
          model: selectedModel
        }])
      }
    } catch (error) {
      console.error('Revision suggestions failed:', error)
    }
  }

  if (!session) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
        <p>You need to be signed in to access the GPT-5 Enhanced Approval Workflow.</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">GPT-5 Enhanced Approval Workflow</h1>
        <p className="text-gray-600">AI-powered content approval with advanced reasoning and analysis</p>
      </div>

      {/* Content Overview */}
      <Card className="mb-6">
        <CardHeader>
          <h3 className="flex items-center justify-between font-semibold">
            <span>{currentItem.title}</span>
            <div className="flex gap-2">
              <Badge variant={currentItem.status === 'In Review' ? 'secondary' : 'default'}>
                {currentItem.status}
              </Badge>
              <Badge variant={currentItem.priority === 'HIGH' ? 'destructive' : 'default'}>
                {currentItem.priority} Priority
              </Badge>
              {currentItem.isOverdue && (
                <Badge variant="destructive">Overdue</Badge>
              )}
              {currentItem.isAIGenerated && (
                <Badge variant="secondary">AI Generated</Badge>
              )}
            </div>
          </h3>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-4">{currentItem.description}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Content Type:</span> {currentItem.contentType}
            </div>
            <div>
              <span className="font-medium">Created:</span> {new Date(currentItem.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric' })}
            </div>
            <div>
              <span className="font-medium">Created By:</span> {currentItem.createdBy}
            </div>
            <div>
              <span className="font-medium">Deadline:</span> {new Date(currentItem.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric' })}
            </div>
          </div>
          {currentItem.isAIGenerated && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>AI Generation Details:</strong> Generated with {currentItem.model} 
                (Verbosity: {currentItem.verbosity}, Effort: {currentItem.reasoningEffort})
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Configuration */}
      <Card className="mb-6">
        <CardHeader>
          <h3 className="font-semibold">GPT-5 AI Configuration</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Model</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="gpt-5">GPT-5</option>
                <option value="gpt-5-mini">GPT-5 Mini</option>
                <option value="gpt-5-nano">GPT-5 Nano</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Verbosity</label>
              <select
                value={verbosity}
                onChange={(e) => setVerbosity(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Reasoning Effort</label>
              <select
                value={reasoningEffort}
                onChange={(e) => setReasoningEffort(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <Button 
              onClick={analyzeContentWithAI}
              disabled={isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? 'Analyzing with GPT-5...' : 'Start AI Content Analysis'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Workflow Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ai-analysis">AI Analysis</TabsTrigger>
          <TabsTrigger value="approval">Approval</TabsTrigger>
          <TabsTrigger value="revision">Revision</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Content Overview</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">Title:</span>
                  <span>{currentItem.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Status:</span>
                  <Badge variant="secondary">{currentItem.status}</Badge>
                </div>
                                 <div className="flex justify-between">
                   <span className="font-medium">Priority:</span>
                   <Badge variant={currentItem.priority === 'HIGH' ? 'danger' : 'default'}>
                     {currentItem.priority}
                   </Badge>
                 </div>
                 <div className="flex justify-between">
                   <span className="font-medium">AI Generated:</span>
                   <Badge variant={currentItem.isAIGenerated ? 'info' : 'default'}>
                     {currentItem.isAIGenerated ? 'Yes' : 'No'}
                   </Badge>
                 </div>
                <div className="flex justify-between">
                  <span className="font-medium">Model Used:</span>
                  <span>{currentItem.model}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-analysis" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">AI Content Analysis</h3>
              
              {!aiAnalysis ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No AI analysis performed yet</p>
                  <Button onClick={analyzeContentWithAI} disabled={isAnalyzing}>
                    {isAnalyzing ? 'Analyzing...' : 'Start AI Analysis'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Quality Scores */}
                  <div>
                    <h4 className="font-medium mb-3">Quality Assessment</h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{aiAnalysis.qualityScore}</div>
                        <div className="text-sm text-gray-600">Overall</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{aiAnalysis.readabilityScore}</div>
                        <div className="text-sm text-gray-600">Readability</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{aiAnalysis.engagementScore}</div>
                        <div className="text-sm text-gray-600">Engagement</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{aiAnalysis.seoScore}</div>
                        <div className="text-sm text-gray-600">SEO</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{aiAnalysis.brandAlignmentScore}</div>
                        <div className="text-sm text-gray-600">Brand</div>
                      </div>
                    </div>
                  </div>

                  {/* AI Insights */}
                  <div>
                    <h4 className="font-medium mb-3">AI Insights</h4>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <ul className="space-y-2">
                        {aiAnalysis.insights.map((insight, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-blue-600 mr-2">•</span>
                            <span className="text-sm">{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h4 className="font-medium mb-3">AI Recommendations</h4>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <ul className="space-y-2">
                        {aiAnalysis.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-green-600 mr-2">•</span>
                            <span className="text-sm">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Additional Analysis */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                                           <h5 className="font-medium mb-2">Sentiment</h5>
                     <Badge variant="info">{aiAnalysis.sentiment}</Badge>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Topics</h5>
                      <div className="flex flex-wrap gap-1">
                        {aiAnalysis.topics.map((topic, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Confidence</h5>
                      <div className="text-2xl font-bold text-blue-600">{aiAnalysis.confidence}%</div>
                    </div>
                  </div>

                  {/* AI Approval Recommendation */}
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h4 className="font-medium mb-2">AI Approval Recommendation</h4>
                    <div className="flex items-center gap-3 mb-3">
                                             <Badge 
                         variant={
                           aiAnalysis.approvalRecommendation === 'approve' ? 'default' :
                           aiAnalysis.approvalRecommendation === 'revision' ? 'secondary' :
                           'danger'
                         }
                       >
                        {aiAnalysis.approvalRecommendation.toUpperCase()}
                      </Badge>
                      <Button 
                        onClick={makeAIApprovalDecision}
                        size="sm"
                        variant="outline"
                      >
                        Get AI Decision
                      </Button>
                    </div>
                    {approvalDecision && (
                      <div className="bg-white p-3 rounded border">
                        <p className="text-sm text-gray-700">{approvalDecision}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approval" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Content Approval</h3>
              
              {!aiAnalysis ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">Complete AI analysis first to enable approval workflow</p>
                  <Button onClick={analyzeContentWithAI}>
                    Start AI Analysis
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">AI Analysis Summary</h4>
                    <p className="text-sm text-gray-700">
                      Quality Score: <strong>{aiAnalysis.qualityScore}/100</strong> | 
                      Recommendation: <strong>{aiAnalysis.approvalRecommendation}</strong> | 
                      Confidence: <strong>{aiAnalysis.confidence}%</strong>
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button 
                      onClick={() => handleApproval('approve')}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      ✅ Approve Content
                    </Button>
                    <Button 
                      onClick={() => handleApproval('revision')}
                      variant="secondary"
                      className="w-full"
                    >
                      🔄 Request Revision
                    </Button>
                                         <Button 
                       onClick={() => handleApproval('reject')}
                       variant="danger"
                       className="w-full"
                     >
                       ❌ Reject Content
                     </Button>
                  </div>

                  {aiAnalysis.approvalRecommendation === 'revision' && (
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <h4 className="font-medium mb-2">AI Suggests Revision</h4>
                      <p className="text-sm text-gray-700 mb-3">
                        The AI analysis indicates this content would benefit from revisions before approval.
                      </p>
                      <Button 
                        onClick={generateRevisionSuggestions}
                        variant="outline"
                        size="sm"
                      >
                        Generate AI Revision Guide
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revision" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Content Revision</h3>
              
              {!aiAnalysis ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">Complete AI analysis first to access revision tools</p>
                  <Button onClick={analyzeContentWithAI}>
                    Start AI Analysis
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <h4 className="font-medium mb-2">Revision Required</h4>
                    <p className="text-sm text-gray-700 mb-3">
                      Based on AI analysis, the following areas need improvement:
                    </p>
                    <ul className="space-y-1 text-sm text-gray-700">
                      {aiAnalysis.insights.slice(0, 3).map((insight, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-orange-600 mr-2">•</span>
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">AI Revision Guide</h4>
                    {!revisionNotes ? (
                      <Button 
                        onClick={generateRevisionSuggestions}
                        variant="outline"
                        className="w-full"
                      >
                        Generate AI-Powered Revision Suggestions
                      </Button>
                    ) : (
                      <div className="bg-white p-4 rounded-lg border">
                        <h5 className="font-medium mb-2">GPT-5 Generated Revision Guide:</h5>
                        <div className="prose prose-sm max-w-none">
                          <pre className="whitespace-pre-wrap text-sm text-gray-700">{revisionNotes}</pre>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Revision Workflow</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                      <li>Review AI analysis and recommendations</li>
                      <li>Generate revision suggestions using GPT-5</li>
                      <li>Implement suggested improvements</li>
                      <li>Re-run AI analysis on revised content</li>
                      <li>Submit for final approval</li>
                    </ol>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Workflow History</h3>
              
              {workflowHistory.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No workflow actions recorded yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {workflowHistory.map((entry, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{entry.action}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(entry.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{entry.details}</p>
                        <span className="text-xs text-blue-600">Model: {entry.model}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
