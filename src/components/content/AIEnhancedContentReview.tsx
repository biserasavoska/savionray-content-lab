'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/common/Card'
import Button from '@/components/ui/common/Button'
import Badge from '@/components/ui/common/Badge'
import { 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  Target,
  Lightbulb,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Share2
} from 'lucide-react'

interface ContentReviewData {
  id: string
  body: string
  contentType: string
  status: string
  createdAt: string
  createdBy: {
    name: string
    email: string
  }
  metadata?: {
    aiEnhanced?: boolean
    aiAnalysis?: any
  }
}

interface AIEnhancedContentReviewProps {
  content: ContentReviewData
  onApprove: (contentId: string) => void
  onReject: (contentId: string, reason: string) => void
  onRequestChanges: (contentId: string, feedback: string) => void
}

interface AIInsight {
  type: 'positive' | 'warning' | 'suggestion'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
}

export default function AIEnhancedContentReview({
  content,
  onApprove,
  onReject,
  onRequestChanges
}: AIEnhancedContentReviewProps) {
  const [aiAnalysis, setAiAnalysis] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    if (content.metadata?.aiAnalysis) {
      setAiAnalysis(content.metadata.aiAnalysis)
      generateInsights(content.metadata.aiAnalysis)
    } else if (content.body.length > 50) {
      analyzeContent()
    }
  }, [content])

  const analyzeContent = async () => {
    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/ai/content-optimization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: content.body, 
          contentType: content.contentType 
        })
      })

      if (response.ok) {
        const analysis = await response.json()
        setAiAnalysis(analysis.optimization)
        generateInsights(analysis.optimization)
      }
    } catch (error) {
      console.error('AI analysis failed:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const generateInsights = (analysis: any) => {
    const newInsights: AIInsight[] = []

    // SEO Insights
    if (analysis.seoScore < 70) {
      newInsights.push({
        type: 'warning',
        title: 'SEO Optimization Needed',
        description: `SEO score is ${analysis.seoScore}/100. Consider adding more keywords and improving meta descriptions.`,
        impact: 'high'
      })
    } else if (analysis.seoScore >= 85) {
      newInsights.push({
        type: 'positive',
        title: 'Excellent SEO',
        description: `Great SEO score of ${analysis.seoScore}/100! This content should perform well in search.`,
        impact: 'high'
      })
    }

    // Readability Insights
    if (analysis.readabilityScore < 60) {
      newInsights.push({
        type: 'warning',
        title: 'Readability Concerns',
        description: `Readability score is ${analysis.readabilityScore}/100. Consider simplifying sentence structure.`,
        impact: 'medium'
      })
    }

    // Engagement Insights
    if (analysis.engagementScore >= 80) {
      newInsights.push({
        type: 'positive',
        title: 'High Engagement Potential',
        description: `Engagement score of ${analysis.engagementScore}/100 suggests this content will resonate well.`,
        impact: 'high'
      })
    }

    // Tone Insights
    if (analysis.toneAnalysis) {
      newInsights.push({
        type: 'suggestion',
        title: `Tone: ${analysis.toneAnalysis.emotion}`,
        description: `Content tone is ${analysis.toneAnalysis.emotion} (${Math.round(analysis.toneAnalysis.confidence * 100)}% confidence).`,
        impact: 'medium'
      })
    }

    // Brand Consistency
    if (analysis.brandConsistency?.score < 70) {
      newInsights.push({
        type: 'warning',
        title: 'Brand Consistency Issues',
        description: `Brand consistency score is ${analysis.brandConsistency.score}/100. Review brand guidelines.`,
        impact: 'high'
      })
    }

    setInsights(newInsights)
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-600" />
      case 'suggestion': return <Lightbulb className="w-4 h-4 text-blue-600" />
      default: return <Sparkles className="w-4 h-4 text-purple-600" />
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Content Preview */}
      <Card>
        <CardHeader>
          <h3 className="flex items-center justify-between">
            <span>Content Preview</span>
            <div className="flex items-center space-x-2">
              {content.metadata?.aiEnhanced && (
                <Badge variant="primary" className="text-xs">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI Enhanced
                </Badge>
              )}
              <Badge variant="secondary" className="text-xs">
                {content.contentType}
              </Badge>
            </div>
          </h3>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg">
              {content.body}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* AI Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Insights */}
        <Card>
          <CardHeader>
            <h3 className="flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
              AI Insights
              {isAnalyzing && <span className="ml-2 text-sm text-muted-foreground">(Analyzing...)</span>}
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights.length > 0 ? (
              insights.map((insight, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border-l-4 ${
                    insight.type === 'positive' ? 'border-l-green-500 bg-green-50' :
                    insight.type === 'warning' ? 'border-l-yellow-500 bg-yellow-50' :
                    'border-l-blue-500 bg-blue-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {getInsightIcon(insight.type)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm">{insight.title}</h4>
                        <span className={`text-xs font-medium ${getImpactColor(insight.impact)}`}>
                          {insight.impact.toUpperCase()} IMPACT
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                {isAnalyzing ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                    <span>Analyzing content...</span>
                  </div>
                ) : (
                  <span>No AI insights available</span>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Metrics */}
        {aiAnalysis && (
          <Card>
            <CardHeader>
              <h3 className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                AI Metrics
              </h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{aiAnalysis.seoScore}</div>
                  <div className="text-xs text-muted-foreground">SEO Score</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{aiAnalysis.readabilityScore}</div>
                  <div className="text-xs text-muted-foreground">Readability</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{aiAnalysis.engagementScore}</div>
                  <div className="text-xs text-muted-foreground">Engagement</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {aiAnalysis.brandConsistency?.score || 'N/A'}
                  </div>
                  <div className="text-xs text-muted-foreground">Brand Consistency</div>
                </div>
              </div>
              
              {aiAnalysis.toneAnalysis && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium mb-1">Tone Analysis</div>
                  <div className="text-sm text-muted-foreground">
                    {aiAnalysis.toneAnalysis.emotion} ({Math.round(aiAnalysis.toneAnalysis.confidence * 100)}% confidence)
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Review Actions */}
      <Card>
        <CardHeader>
          <h3>Review Actions</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Feedback (Optional)</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Add feedback or suggestions for the content creator..."
              className="w-full p-3 border rounded-lg resize-none"
              rows={3}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <Button
                variant="success"
                onClick={() => onApprove(content.id)}
                icon={<ThumbsUp className="w-4 h-4" />}
              >
                Approve
              </Button>
              <Button
                variant="secondary"
                onClick={() => onRequestChanges(content.id, feedback)}
                disabled={!feedback.trim()}
                icon={<MessageSquare className="w-4 h-4" />}
              >
                Request Changes
              </Button>
              <Button
                variant="danger"
                onClick={() => onReject(content.id, feedback || 'Content rejected')}
                icon={<ThumbsDown className="w-4 h-4" />}
              >
                Reject
              </Button>
            </div>
            
            <Button
              variant="secondary"
              onClick={analyzeContent}
              disabled={isAnalyzing}
              icon={<Sparkles className="w-4 h-4" />}
            >
              {isAnalyzing ? 'Analyzing...' : 'Re-analyze'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 