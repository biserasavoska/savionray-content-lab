'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Lightbulb, 
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Zap,
  BookOpen,
  MessageSquare
} from 'lucide-react'
import { AVAILABLE_MODELS } from '@/lib/models'

interface ReasoningStep {
  content: string;
  confidence?: number;
}

interface ReasoningAnalysis {
  analysis: {
    content: string;
    confidence: number;
    insights: string[];
    recommendations: string[];
  };
  reasoning: {
    steps: string[];
    confidence: number;
    summary: string;
  };
}

interface StrategicResult {
  strategy: {
    analysis: string;
    recommendations: string[];
  };
  content: {
    postText: string;
    hashtags: string[];
    callToAction: string;
  };
  reasoning?: {
    steps: string[];
    confidence: number;
    summary: string;
  };
}

interface ReasoningContentAssistantProps {
  currentContent: string;
  contentType: string;
  targetAudience?: string;
  brandVoice?: string;
  onContentApply?: (content: any) => void;
  onStrategyApply?: (strategy: any) => void;
}

export default function ReasoningContentAssistant({
  currentContent,
  contentType,
  targetAudience = 'professionals',
  brandVoice = 'professional',
  onContentApply,
  onStrategyApply
}: ReasoningContentAssistantProps) {
  const { data: session } = useSession()
  const [analysis, setAnalysis] = useState<ReasoningAnalysis | null>(null)
  const [strategicResult, setStrategicResult] = useState<StrategicResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState<'analysis' | 'strategy' | 'step-by-step'>('analysis')
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS.find(m => m.supportsReasoning) || AVAILABLE_MODELS[0])
  const [error, setError] = useState<string | null>(null)
  const [showReasoning, setShowReasoning] = useState(false)
  
  const contentRef = useRef<string>(currentContent)
  const debounceRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    contentRef.current = currentContent
  }, [currentContent])

  const analyzeContent = async () => {
    if (!session?.user || !currentContent.trim()) return

    setIsAnalyzing(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/content-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: currentContent,
          contentType,
          targetAudience,
          brandVoice,
          model: selectedModel.id,
          includeStepByStep: true,
          includeConfidence: true
        })
      })

      if (!response.ok) {
        throw new Error('Failed to analyze content')
      }

      const data = await response.json()
      setAnalysis(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze content')
      console.error('Error analyzing content:', err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const generateStrategicContent = async () => {
    if (!session?.user || !currentContent.trim()) return

    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/strategic-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: currentContent.substring(0, 100),
          audience: targetAudience,
          goals: ['Increase engagement', 'Build brand awareness', 'Drive conversions'],
          constraints: ['Professional tone', 'Industry compliance', 'Character limits'],
          model: selectedModel.id,
          includeReasoning: true
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate strategic content')
      }

      const data = await response.json()
      setStrategicResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate strategic content')
      console.error('Error generating strategic content:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600'
    if (confidence >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 80) return <CheckCircle className="w-4 h-4" />
    if (confidence >= 60) return <AlertCircle className="w-4 h-4" />
    return <AlertCircle className="w-4 h-4" />
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">AI Reasoning Assistant</h3>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
              {selectedModel.name}
            </span>
          </div>
          <button
            onClick={() => setShowReasoning(!showReasoning)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {showReasoning ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {showReasoning && (
        <div className="p-4 space-y-4">
          {/* Model Selector */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Model:</label>
            <select
              value={selectedModel.id}
              onChange={(e) => setSelectedModel(AVAILABLE_MODELS.find(m => m.id === e.target.value) || AVAILABLE_MODELS[0])}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              {AVAILABLE_MODELS.filter(m => m.supportsReasoning).map(model => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('analysis')}
              className={`px-3 py-2 text-sm font-medium rounded-t-lg ${
                activeTab === 'analysis'
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-1" />
              Analysis
            </button>
            <button
              onClick={() => setActiveTab('strategy')}
              className={`px-3 py-2 text-sm font-medium rounded-t-lg ${
                activeTab === 'strategy'
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Target className="w-4 h-4 inline mr-1" />
              Strategy
            </button>
            <button
              onClick={() => setActiveTab('step-by-step')}
              className={`px-3 py-2 text-sm font-medium rounded-t-lg ${
                activeTab === 'step-by-step'
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <BookOpen className="w-4 h-4 inline mr-1" />
              Step-by-Step
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Content */}
          <div className="space-y-4">
            {activeTab === 'analysis' && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-md font-medium text-gray-900">Content Analysis</h4>
                  <button
                    onClick={analyzeContent}
                    disabled={isAnalyzing || !currentContent.trim()}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isAnalyzing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Brain className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {analysis && (
                  <div className="space-y-4">
                    {/* Confidence Score */}
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">Confidence:</span>
                      <span className={`text-sm font-semibold ${getConfidenceColor(analysis.reasoning.confidence)}`}>
                        {analysis.reasoning.confidence}%
                      </span>
                      {getConfidenceIcon(analysis.reasoning.confidence)}
                    </div>

                    {/* Analysis Content */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Analysis</h5>
                      <p className="text-sm text-gray-700">{analysis.analysis.content}</p>
                    </div>

                    {/* Key Insights */}
                    <div>
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Key Insights</h5>
                      <ul className="space-y-1">
                        {analysis.analysis.insights.map((insight, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start">
                            <Lightbulb className="w-3 h-3 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                            {insight}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Recommendations */}
                    <div>
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Recommendations</h5>
                      <ul className="space-y-1">
                        {analysis.analysis.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start">
                            <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Reasoning Steps */}
                    <div>
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Reasoning Process</h5>
                      <div className="space-y-2">
                        {analysis.reasoning.steps.map((step, index) => (
                          <div key={index} className="bg-blue-50 p-2 rounded text-sm text-gray-700">
                            <span className="font-medium">Step {index + 1}:</span> {step}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'strategy' && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-md font-medium text-gray-900">Strategic Content Generation</h4>
                  <button
                    onClick={generateStrategicContent}
                    disabled={isGenerating || !currentContent.trim()}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Target className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {strategicResult && (
                  <div className="space-y-4">
                    {/* Strategy Analysis */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Strategy Analysis</h5>
                      <p className="text-sm text-gray-700">{strategicResult.strategy.analysis}</p>
                    </div>

                    {/* Strategic Recommendations */}
                    <div>
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Strategic Recommendations</h5>
                      <ul className="space-y-1">
                        {strategicResult.strategy.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start">
                            <TrendingUp className="w-3 h-3 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Generated Content */}
                    <div className="bg-green-50 p-3 rounded-lg">
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Generated Content</h5>
                      <p className="text-sm text-gray-700 mb-2">{strategicResult.content.postText}</p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {strategicResult.content.hashtags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 italic">{strategicResult.content.callToAction}</p>
                    </div>

                    {/* Apply Button */}
                    <button
                      onClick={() => onContentApply?.(strategicResult.content)}
                      className="w-full px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      Apply Generated Content
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'step-by-step' && (
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3">Step-by-Step Reasoning</h4>
                <p className="text-sm text-gray-600">
                  This tab shows the detailed reasoning process used by the AI model to analyze and generate content.
                  Each step represents a logical progression in the AI's thinking process.
                </p>
                
                {analysis && (
                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Reasoning Steps</h5>
                    <div className="space-y-3">
                      {analysis.reasoning.steps.map((step, index) => (
                        <div key={index} className="border-l-4 border-blue-500 pl-4">
                          <div className="flex items-start space-x-2">
                            <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">
                              {index + 1}
                            </span>
                            <p className="text-sm text-gray-700">{step}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Summary</h5>
                      <p className="text-sm text-gray-700">{analysis.reasoning.summary}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 