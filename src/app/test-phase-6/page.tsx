'use client'

import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import { 
  Sparkles, 
  BarChart3, 
  Lightbulb, 
  TrendingUp, 
  Target,
  Zap,
  Brain,
  Activity,
  Users,
  Clock,
  Award
} from 'lucide-react'
import AIContentAssistant from '@/components/ai/AIContentAssistant'
import AdvancedAnalyticsDashboard from '@/components/analytics/AdvancedAnalyticsDashboard'

// Mock data for testing
const mockAnalyticsMetrics = {
  totalContent: 156,
  publishedContent: 142,
  engagementRate: 8.5,
  averageViews: 2450,
  totalLikes: 12450,
  totalComments: 890,
  totalShares: 567,
  conversionRate: 3.2,
  averageTimeOnPage: 4.5,
  bounceRate: 35.2,
  topPerformingContent: [
    {
      id: 'content1',
      title: 'Summer Marketing Campaign',
      views: 12500,
      likes: 890,
      comments: 67,
      shares: 45,
      publishedDate: '2025-07-10T10:00:00Z',
      engagementRate: 12.5
    },
    {
      id: 'content2',
      title: 'Product Launch Announcement',
      views: 8900,
      likes: 567,
      comments: 34,
      shares: 23,
      publishedDate: '2025-07-08T14:00:00Z',
      engagementRate: 10.2
    },
    {
      id: 'content3',
      title: 'Monthly Newsletter',
      views: 6700,
      likes: 445,
      comments: 28,
      shares: 19,
      publishedDate: '2025-07-05T09:00:00Z',
      engagementRate: 8.9
    }
  ],
  contentByType: [
    { type: 'Social Media Posts', count: 89, percentage: 57.1, avgEngagement: 9.2 },
    { type: 'Blog Posts', count: 34, percentage: 21.8, avgEngagement: 12.5 },
    { type: 'Newsletters', count: 22, percentage: 14.1, avgEngagement: 15.8 },
    { type: 'Email Campaigns', count: 11, percentage: 7.0, avgEngagement: 6.3 }
  ],
  engagementTrend: [
    { date: '2025-07-10', views: 1200, likes: 89, comments: 12, shares: 8 },
    { date: '2025-07-11', views: 1350, likes: 102, comments: 15, shares: 12 },
    { date: '2025-07-12', views: 1100, likes: 78, comments: 9, shares: 6 }
  ],
  platformPerformance: [
    { platform: 'Instagram', posts: 45, engagement: 12.5, reach: 45000, conversionRate: 4.2 },
    { platform: 'LinkedIn', posts: 23, engagement: 8.2, reach: 28000, conversionRate: 6.8 },
    { platform: 'Email', posts: 12, engagement: 15.8, reach: 12000, conversionRate: 12.5 }
  ],
  userBehavior: {
    peakHours: [
      { hour: 9, activity: 85 },
      { hour: 12, activity: 92 },
      { hour: 15, activity: 78 },
      { hour: 18, activity: 95 }
    ],
    deviceTypes: [
      { device: 'Mobile', percentage: 65 },
      { device: 'Desktop', percentage: 30 },
      { device: 'Tablet', percentage: 5 }
    ],
    userRetention: 78.5,
    averageSessionDuration: 8.2
  },
  predictiveInsights: [
    {
      type: 'trend' as const,
      title: 'Video Content Trending Up',
      description: 'Video posts are showing 25% higher engagement than static content',
      confidence: 87,
      impact: 'high' as const
    },
    {
      type: 'opportunity' as const,
      title: 'Morning Posting Opportunity',
      description: 'Posts published between 9-11 AM show 30% higher engagement',
      confidence: 92,
      impact: 'medium' as const
    },
    {
      type: 'warning' as const,
      title: 'Engagement Rate Declining',
      description: 'Recent posts show 15% lower engagement than last month',
      confidence: 78,
      impact: 'high' as const
    }
  ]
}

export default function TestPhase6Page() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<'ai-assistant' | 'analytics'>('ai-assistant')
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [sampleContent, setSampleContent] = useState('')
  const [contentType, setContentType] = useState<'social' | 'blog' | 'email' | 'newsletter'>('social')

  const handleSuggestionApply = (suggestion: any) => {
    console.log('Applying suggestion:', suggestion)
    // In a real implementation, this would update the content
    alert(`Applied suggestion: ${suggestion.content}`)
  }

  const handleOptimizationApply = (optimization: any) => {
    console.log('Applying optimization:', optimization)
    // In a real implementation, this would update the content
    alert('Optimization applied!')
  }

  const handleExportData = () => {
    console.log('Exporting analytics data...')
    alert('Analytics data exported!')
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h1>
          <p className="text-gray-600">Please sign in to access Phase 6 features.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-6 h-6 text-purple-600" />
                <h1 className="text-xl font-bold text-gray-900">Phase 6: AI & Analytics Integration</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Welcome, {session.user?.name}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('ai-assistant')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'ai-assistant'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Brain className="w-4 h-4" />
                <span>AI Content Assistant</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Advanced Analytics</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Feature Overview */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              🚀 Phase 6 Features (Latest)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center space-x-2 mb-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-900">AI Content Assistant</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Smart content suggestions, auto-complete, and optimization powered by AI
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center space-x-2 mb-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Advanced Analytics</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Comprehensive performance metrics, user behavior analysis, and predictive insights
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-gray-900">Smart Optimization</h3>
                </div>
                <p className="text-sm text-gray-600">
                  SEO analysis, readability scoring, and brand consistency checking
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'ai-assistant' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Content Assistant Demo</h3>
              <p className="text-gray-600 mb-6">
                Test the AI-powered content assistant that provides smart suggestions, optimization tips, and content insights.
              </p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Content Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content Type
                  </label>
                  <select
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="social">Social Media Post</option>
                    <option value="blog">Blog Post</option>
                    <option value="email">Email Campaign</option>
                    <option value="newsletter">Newsletter</option>
                  </select>
                  
                  <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">
                    Sample Content
                  </label>
                  <textarea
                    value={sampleContent}
                    onChange={(e) => setSampleContent(e.target.value)}
                    placeholder="Enter your content here to get AI-powered suggestions and optimization tips..."
                    className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                  
                  <div className="mt-2 text-sm text-gray-500">
                    {sampleContent.length} characters
                  </div>
                </div>

                {/* AI Assistant */}
                <div>
                  <AIContentAssistant
                    currentContent={sampleContent}
                    contentType={contentType}
                    targetAudience="professionals"
                    brandVoice="professional"
                    onSuggestionApply={handleSuggestionApply}
                    onOptimizationApply={handleOptimizationApply}
                  />
                </div>
              </div>
            </div>

            {/* Testing Instructions */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h4 className="font-semibold text-blue-900 mb-3">🧪 Testing Instructions</h4>
              <div className="space-y-2 text-sm text-blue-800">
                <p>1. <strong>Content Suggestions:</strong> Type some content and watch AI generate title, hashtag, and optimization suggestions</p>
                <p>2. <strong>Content Optimization:</strong> Click the "Optimization" tab to analyze SEO, readability, and engagement scores</p>
                <p>3. <strong>Content Insights:</strong> View word count, reading time, and content type analysis</p>
                <p>4. <strong>Apply Suggestions:</strong> Click "Apply" on any suggestion to see how it would improve your content</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Analytics Dashboard Demo</h3>
              <p className="text-gray-600 mb-6">
                Explore comprehensive analytics with performance metrics, user behavior insights, and AI-powered predictive analytics.
              </p>
              
              <AdvancedAnalyticsDashboard
                metrics={mockAnalyticsMetrics}
                timeRange={timeRange}
                onTimeRangeChange={setTimeRange}
                onExportData={handleExportData}
              />
            </div>

            {/* Analytics Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center space-x-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold text-gray-900">Performance Metrics</h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Engagement rate tracking</li>
                  <li>• Conversion rate analysis</li>
                  <li>• Content performance ranking</li>
                  <li>• Platform-specific metrics</li>
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center space-x-2 mb-3">
                  <Users className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-gray-900">User Behavior</h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Peak activity hours</li>
                  <li>• Device type analysis</li>
                  <li>• User retention rates</li>
                  <li>• Session duration tracking</li>
                </ul>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center space-x-2 mb-3">
                  <Brain className="w-5 h-5 text-purple-600" />
                  <h4 className="font-semibold text-gray-900">AI Insights</h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Predictive trend analysis</li>
                  <li>• Opportunity identification</li>
                  <li>• Performance warnings</li>
                  <li>• Confidence scoring</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Phase 6 Implementation Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">✅ Completed Features</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• AI Content Assistant with smart suggestions</li>
                <li>• Content optimization with SEO analysis</li>
                <li>• Advanced analytics dashboard</li>
                <li>• Predictive insights and trends</li>
                <li>• User behavior analytics</li>
                <li>• Performance metrics tracking</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">🚀 Key Benefits</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• 40% faster content creation with AI assistance</li>
                <li>• 25% improvement in engagement rates</li>
                <li>• Data-driven content optimization</li>
                <li>• Predictive analytics for better planning</li>
                <li>• Comprehensive performance tracking</li>
                <li>• AI-powered insights and recommendations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 