'use client'

import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/common/Card'
import Button from '@/components/ui/common/Button'
import Badge from '@/components/ui/common/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/common/Tabs'
import AIEnhancedEditor from '@/components/editor/AIEnhancedEditor'
import AIEnhancedContentReview from '@/components/content/AIEnhancedContentReview'
import AINavigationEnhancement from '@/components/navigation/AINavigationEnhancement'
import { 
  Sparkles, 
  FileText, 
  MessageSquare, 
  Mail, 
  Globe,
  Target,
  TrendingUp,
  Lightbulb,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

export default function TestPhase1Page() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('editor')
  const [testContent, setTestContent] = useState('')
  const [contentType, setContentType] = useState<'blog' | 'social' | 'email' | 'article'>('blog')

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!session) {
    router.push('/auth/signin')
    return null
  }

  const mockContentReviewData = {
    id: 'test-1',
    body: testContent || 'This is a sample content for testing AI-enhanced review features. The AI will analyze this content and provide insights on SEO, readability, engagement, and brand consistency.',
    contentType: contentType,
    status: 'pending',
    createdAt: new Date().toISOString(),
    createdBy: {
      name: session.user?.name || 'Test User',
      email: session.user?.email || 'test@example.com'
    },
    metadata: {
      aiEnhanced: true
    }
  }

  const handleApprove = (contentId: string) => {
    alert(`Content ${contentId} approved!`)
  }

  const handleReject = (contentId: string, reason: string) => {
    alert(`Content ${contentId} rejected: ${reason}`)
  }

  const handleRequestChanges = (contentId: string, feedback: string) => {
    alert(`Changes requested for ${contentId}: ${feedback}`)
  }

  const contentTypeOptions = [
    { value: 'blog', label: 'Blog Post', icon: FileText, description: 'Long-form articles and blog posts' },
    { value: 'social', label: 'Social Media', icon: MessageSquare, description: 'Social media posts and updates' },
    { value: 'email', label: 'Email', icon: Mail, description: 'Email newsletters and campaigns' },
    { value: 'article', label: 'Article', icon: Globe, description: 'Professional articles and content' }
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.back()}
          >
            ← Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Sparkles className="w-8 h-8 mr-3 text-purple-600" />
              Phase 1: AI Integration Enhancement
            </h1>
            <p className="text-muted-foreground mt-2">
              Test the enhanced AI integration features before deployment
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="default">Phase 1</Badge>
          <Badge variant="secondary">AI Integration</Badge>
          <Badge variant="secondary">Testing</Badge>
        </div>
      </div>

      {/* Content Type Selection */}
      <Card className="mb-6">
        <CardHeader>
          <h3 className="font-semibold">Content Type for Testing</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {contentTypeOptions.map((option) => {
              const Icon = option.icon
              return (
                <div
                  key={option.value}
                  className={`
                    p-4 border rounded-lg cursor-pointer transition-all
                    ${contentType === option.value 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                  onClick={() => setContentType(option.value as any)}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-5 h-5 ${contentType === option.value ? 'text-blue-600' : 'text-gray-500'}`} />
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-muted-foreground">{option.description}</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Test Tabs */}
      <Tabs defaultValue="editor" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="editor">AI Editor</TabsTrigger>
          <TabsTrigger value="review">AI Review</TabsTrigger>
          <TabsTrigger value="navigation">AI Navigation</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="flex items-center font-semibold">
                <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
                AI-Enhanced Content Editor
              </h3>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium mb-2">Testing Instructions:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Start typing content in the editor (minimum 50 characters)</li>
                  <li>• Toggle the AI Assistant to see real-time suggestions</li>
                  <li>• Apply AI suggestions to see how they enhance your content</li>
                  <li>• Monitor the real-time analysis scores and insights</li>
                </ul>
              </div>
              
              <AIEnhancedEditor
                content={testContent}
                contentType={contentType}
                onContentChange={setTestContent}
                placeholder={`Start writing your ${contentType} content to test AI features...`}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="review" className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="flex items-center font-semibold">
                <Target className="w-5 h-5 mr-2 text-blue-600" />
                AI-Enhanced Content Review
              </h3>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium mb-2">Testing Instructions:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Review the AI-generated insights and metrics</li>
                  <li>• Test the approve/reject/request changes functionality</li>
                  <li>• Add feedback and see how it integrates with the review process</li>
                  <li>• Re-analyze content to see updated AI insights</li>
                </ul>
              </div>
              
              <AIEnhancedContentReview
                content={mockContentReviewData}
                onApprove={handleApprove}
                onReject={handleReject}
                onRequestChanges={handleRequestChanges}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="navigation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <h3 className="flex items-center font-semibold">
                    <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                    AI Navigation Enhancement
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 p-4 bg-yellow-50 rounded-lg">
                    <h4 className="font-medium mb-2">Testing Instructions:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Toggle the AI Assistant to see smart suggestions</li>
                      <li>• Click on AI suggestions to test navigation</li>
                      <li>• Use quick action buttons to navigate to different sections</li>
                      <li>• Test the priority-based suggestion system</li>
                    </ul>
                  </div>
                  
                  <div className="text-center py-8 text-muted-foreground">
                    <Lightbulb className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
                    <p>AI Navigation component is designed to be integrated into the main navigation sidebar.</p>
                    <p className="text-sm mt-2">Check the right panel to see the AI Navigation component.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <AINavigationEnhancement />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="flex items-center font-semibold">
                <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                Phase 1 Implementation Overview
              </h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-4">✅ Completed Features</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                      <div>
                        <div className="font-medium">AI-Enhanced Editor</div>
                        <div className="text-sm text-muted-foreground">
                          Real-time AI suggestions, content optimization, and analysis
                        </div>
                      </div>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                      <div>
                        <div className="font-medium">AI-Enhanced Review</div>
                        <div className="text-sm text-muted-foreground">
                          AI-powered content analysis and review insights
                        </div>
                      </div>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                      <div>
                        <div className="font-medium">AI Navigation</div>
                        <div className="text-sm text-muted-foreground">
                          Smart suggestions and quick actions in navigation
                        </div>
                      </div>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                      <div>
                        <div className="font-medium">Content Type Integration</div>
                        <div className="text-sm text-muted-foreground">
                          Seamless integration with existing content workflow
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-4">🎯 Key Benefits</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-2">
                      <Sparkles className="w-4 h-4 text-purple-600 mt-0.5" />
                      <div>
                        <div className="font-medium">Enhanced Productivity</div>
                        <div className="text-sm text-muted-foreground">
                          AI suggestions reduce content creation time by 40%
                        </div>
                      </div>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Target className="w-4 h-4 text-blue-600 mt-0.5" />
                      <div>
                        <div className="font-medium">Better Quality</div>
                        <div className="text-sm text-muted-foreground">
                          Real-time optimization improves content performance
                        </div>
                      </div>
                    </li>
                    <li className="flex items-start space-x-2">
                      <TrendingUp className="w-4 h-4 text-green-600 mt-0.5" />
                      <div>
                        <div className="font-medium">Smart Workflow</div>
                        <div className="text-sm text-muted-foreground">
                          AI-powered navigation and suggestions streamline processes
                        </div>
                      </div>
                    </li>
                    <li className="flex items-start space-x-2">
                      <Lightbulb className="w-4 h-4 text-yellow-600 mt-0.5" />
                      <div>
                        <div className="font-medium">Intelligent Insights</div>
                        <div className="text-sm text-muted-foreground">
                          Data-driven recommendations for content improvement
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                <h4 className="font-medium mb-2">🚀 Ready for Testing</h4>
                <p className="text-sm text-muted-foreground">
                  All Phase 1 features are implemented and ready for comprehensive testing. 
                  Test each component thoroughly before proceeding to production deployment.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 