'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { 
  Sparkles, 
  Lightbulb, 
  TrendingUp, 
  Target, 
  MessageSquare, 
  Zap,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

interface ContentSuggestion {
  id: string
  type: 'title' | 'description' | 'hashtag' | 'tone' | 'optimization'
  content: string
  confidence: number
  reasoning?: string
}

interface ContentOptimization {
  seoScore: number
  readabilityScore: number
  engagementScore: number
  suggestions: string[]
  toneAnalysis: {
    current: string
    suggested: string
    reasoning: string
  }
  brandConsistency: {
    score: number
    issues: string[]
    improvements: string[]
  }
}

interface AIContentAssistantProps {
  currentContent: string
  contentType: 'social' | 'blog' | 'email' | 'newsletter'
  targetAudience?: string
  brandVoice?: string
  onSuggestionApply: (suggestion: ContentSuggestion) => void
  onOptimizationApply: (optimization: ContentOptimization) => void
}

export default function AIContentAssistant({
  currentContent,
  contentType,
  targetAudience = 'professionals',
  brandVoice = 'professional',
  onSuggestionApply,
  onOptimizationApply
}: AIContentAssistantProps) {
  const { data: session } = useSession()
  const [suggestions, setSuggestions] = useState<ContentSuggestion[]>([])
  const [optimization, setOptimization] = useState<ContentOptimization | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState<'suggestions' | 'optimization' | 'insights'>('suggestions')
  const [error, setError] = useState<string | null>(null)
  
  const contentRef = useRef<string>(currentContent)
  const debounceRef = useRef<NodeJS.Timeout>()

  // Update content ref when content changes
  useEffect(() => {
    contentRef.current = currentContent
  }, [currentContent])

  // Generate suggestions when content changes
  useEffect(() => {
    if (!currentContent.trim()) {
      setSuggestions([])
      return
    }

    // Debounce the API call
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      generateSuggestions()
    }, 1000)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [currentContent, contentType, targetAudience])

  const generateSuggestions = async () => {
    if (!session?.user) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/content-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: currentContent,
          contentType,
          targetAudience,
          brandVoice
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate suggestions')
      }

      const data = await response.json()
      setSuggestions(data.suggestions || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate suggestions')
      console.error('Error generating suggestions:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const analyzeContent = async () => {
    if (!session?.user || !currentContent.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/content-optimization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: currentContent,
          contentType,
          targetAudience,
          brandVoice
        })
      })

      if (!response.ok) {
        throw new Error('Failed to analyze content')
      }

      const data = await response.json()
      setOptimization(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze content')
      console.error('Error analyzing content:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestionApply = (suggestion: ContentSuggestion) => {
    onSuggestionApply(suggestion)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-4 h-4 text-green-600" />
    if (score >= 60) return <AlertCircle className="w-4 h-4 text-yellow-600" />
    return <AlertCircle className="w-4 h-4 text-red-600" />
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">AI Content Assistant</h3>
            {isLoading && <Loader2 className="w-4 h-4 animate-spin text-gray-500" />}
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-md hover:bg-gray-100"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4">
          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex space-x-1 mb-4 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('suggestions')}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'suggestions'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Lightbulb className="w-4 h-4 inline mr-1" />
              Suggestions
            </button>
            <button
              onClick={() => {
                setActiveTab('optimization')
                if (!optimization) analyzeContent()
              }}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'optimization'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <TrendingUp className="w-4 h-4 inline mr-1" />
              Optimization
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'insights'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Target className="w-4 h-4 inline mr-1" />
              Insights
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'suggestions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Smart Suggestions</h4>
                <button
                  onClick={generateSuggestions}
                  disabled={isLoading}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  <Zap className="w-3 h-3" />
                  <span>Refresh</span>
                </button>
              </div>

              {suggestions.length > 0 ? (
                <div className="space-y-3">
                  {suggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                            {suggestion.type}
                          </span>
                          <span className="text-sm text-gray-500">
                            {Math.round(suggestion.confidence * 100)}% confidence
                          </span>
                        </div>
                        <button
                          onClick={() => handleSuggestionApply(suggestion)}
                          className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                        >
                          Apply
                        </button>
                      </div>
                      <p className="text-sm text-gray-900 mb-2">{suggestion.content}</p>
                      {suggestion.reasoning && (
                        <p className="text-xs text-gray-500 italic">
                          "{suggestion.reasoning}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Lightbulb className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>Start typing to get AI-powered suggestions</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'optimization' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Content Optimization</h4>
                <button
                  onClick={analyzeContent}
                  disabled={isLoading}
                  className="flex items-center space-x-1 px-3 py-1 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700 disabled:opacity-50"
                >
                  <TrendingUp className="w-3 h-3" />
                  <span>Analyze</span>
                </button>
              </div>

              {optimization ? (
                <div className="space-y-4">
                  {/* Scores */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-center mb-1">
                        {getScoreIcon(optimization.seoScore)}
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{optimization.seoScore}</p>
                      <p className="text-xs text-gray-500">SEO Score</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-center mb-1">
                        {getScoreIcon(optimization.readabilityScore)}
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{optimization.readabilityScore}</p>
                      <p className="text-xs text-gray-500">Readability</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-center mb-1">
                        {getScoreIcon(optimization.engagementScore)}
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{optimization.engagementScore}</p>
                      <p className="text-xs text-gray-500">Engagement</p>
                    </div>
                  </div>

                  {/* Tone Analysis */}
                  <div className="p-3 border border-gray-200 rounded-lg">
                    <h5 className="font-medium text-gray-900 mb-2">Tone Analysis</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Current:</span>
                        <span className="font-medium">{optimization.toneAnalysis.current}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Suggested:</span>
                        <span className="font-medium text-blue-600">{optimization.toneAnalysis.suggested}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {optimization.toneAnalysis.reasoning}
                      </p>
                    </div>
                  </div>

                  {/* Brand Consistency */}
                  <div className="p-3 border border-gray-200 rounded-lg">
                    <h5 className="font-medium text-gray-900 mb-2">Brand Consistency</h5>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Score:</span>
                      <span className={`font-bold ${getScoreColor(optimization.brandConsistency.score)}`}>
                        {optimization.brandConsistency.score}/100
                      </span>
                    </div>
                    {optimization.brandConsistency.improvements.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Improvements:</p>
                        <ul className="text-xs text-gray-700 space-y-1">
                          {optimization.brandConsistency.improvements.map((improvement, index) => (
                            <li key={index} className="flex items-start space-x-1">
                              <span className="text-green-600 mt-0.5">•</span>
                              <span>{improvement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Suggestions */}
                  {optimization.suggestions.length > 0 && (
                    <div className="p-3 border border-gray-200 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-2">Optimization Suggestions</h5>
                      <ul className="space-y-2">
                        {optimization.suggestions.map((suggestion, index) => (
                          <li key={index} className="flex items-start space-x-2 text-sm">
                            <span className="text-blue-600 mt-0.5">•</span>
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>Click "Analyze" to get optimization insights</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Content Insights</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Word Count</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">
                    {currentContent.split(/\s+/).filter(word => word.length > 0).length}
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-900">Reading Time</span>
                  </div>
                  <p className="text-2xl font-bold text-green-900">
                    {Math.ceil(currentContent.split(/\s+/).length / 200)} min
                  </p>
                </div>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <h5 className="font-medium text-gray-900 mb-2">Content Type Analysis</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium capitalize">{contentType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Target Audience:</span>
                    <span className="font-medium capitalize">{targetAudience}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Brand Voice:</span>
                    <span className="font-medium capitalize">{brandVoice}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 