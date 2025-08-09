'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  Brain, 
  Lightbulb, 
  Target, 
  BarChart3, 
  Loader2, 
  CheckCircle, 
  AlertTriangle,
  Zap,
  Eye,
  TrendingUp,
  MessageSquare,
  Settings,
  Clock
} from 'lucide-react'
import { AVAILABLE_MODELS } from '@/lib/models'
import { getOptimalGPT5Model } from '@/lib/openai'

interface GPT5EnhancedEditorProps {
  ideaId?: string
  initialContent?: string
  onContentGenerated?: (content: any) => void
  onSave?: (content: string) => void
}

interface GenerationStep {
  id: string
  name: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  description: string
  duration?: number
  confidence?: number
}

interface ReasoningInsight {
  type: 'strategy' | 'audience' | 'tone' | 'engagement' | 'optimization'
  confidence: number
  insight: string
  recommendation?: string
}

export default function GPT5EnhancedEditor({
  ideaId,
  initialContent = '',
  onContentGenerated,
  onSave
}: GPT5EnhancedEditorProps) {
  const { data: session } = useSession()
  const [content, setContent] = useState(initialContent)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>([])
  const [reasoningInsights, setReasoningInsights] = useState<ReasoningInsight[]>([])
  const [selectedModel, setSelectedModel] = useState('gpt-5-mini')
  const [verbosity, setVerbosity] = useState<'low' | 'medium' | 'high'>('medium')
  const [reasoningEffort, setReasoningEffort] = useState<'minimal' | 'low' | 'medium' | 'high'>('medium')
  const [useOptimalRouting, setUseOptimalRouting] = useState(false)
  const [showReasoningPanel, setShowReasoningPanel] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'editor' | 'reasoning' | 'insights'>('editor')

  const gpt5Models = AVAILABLE_MODELS.filter(m => m.supportsGPT5Features)

  useEffect(() => {
    if (useOptimalRouting) {
      const optimal = getOptimalGPT5Model('medium', 'standard', 'balanced')
      setSelectedModel(optimal.model)
      setVerbosity(optimal.gpt5Options.verbosity as 'low' | 'medium' | 'high')
      setReasoningEffort(optimal.gpt5Options.reasoningEffort as 'minimal' | 'low' | 'medium' | 'high')
    }
  }, [useOptimalRouting])

  const simulateGenerationSteps = () => {
    const steps: GenerationStep[] = [
      {
        id: '1',
        name: 'Analyzing Context',
        status: 'pending',
        description: 'Understanding the content requirements and context'
      },
      {
        id: '2', 
        name: 'Strategic Planning',
        status: 'pending',
        description: 'Developing content strategy and approach'
      },
      {
        id: '3',
        name: 'Content Generation',
        status: 'pending', 
        description: 'Creating engaging content with reasoning'
      },
      {
        id: '4',
        name: 'Optimization',
        status: 'pending',
        description: 'Optimizing for engagement and effectiveness'
      },
      {
        id: '5',
        name: 'Quality Validation',
        status: 'pending',
        description: 'Validating content quality and coherence'
      }
    ]
    setGenerationSteps(steps)
    return steps
  }

  const processStepByStep = async (steps: GenerationStep[]) => {
    for (let i = 0; i < steps.length; i++) {
      // Update current step to processing
      setGenerationSteps(prev => prev.map((step, index) => 
        index === i ? { ...step, status: 'processing' } : step
      ))

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200))

      // Complete the step
      setGenerationSteps(prev => prev.map((step, index) => 
        index === i ? { 
          ...step, 
          status: 'completed',
          duration: Math.floor(800 + Math.random() * 1200),
          confidence: Math.floor(80 + Math.random() * 20)
        } : step
      ))

      // Add insights for specific steps
      if (i === 1) {
        setReasoningInsights(prev => [...prev, {
          type: 'strategy',
          confidence: 85,
          insight: 'Content should focus on professional value proposition',
          recommendation: 'Emphasize practical benefits and industry relevance'
        }])
      }
      
      if (i === 2) {
        setReasoningInsights(prev => [...prev, {
          type: 'audience',
          confidence: 92,
          insight: 'Target audience responds well to data-driven insights',
          recommendation: 'Include specific metrics or case studies'
        }])
      }
    }
  }

  const generateContent = async () => {
    if (!session?.user) return

    setIsGenerating(true)
    setShowReasoningPanel(true)
    setActiveTab('reasoning')
    
    // Initialize steps
    const steps = simulateGenerationSteps()
    
    try {
      // Start step-by-step processing
      const stepPromise = processStepByStep(steps)
      
      // Actual content generation
      const response = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Enhanced Content Generation',
          description: content || 'Generate engaging content using GPT-5 reasoning',
          format: 'linkedin',
          model: selectedModel,
          verbosity: verbosity,
          reasoningEffort: reasoningEffort,
          maxOutputTokens: 3000
        })
      })

      const data = await response.json()
      
      // Wait for steps to complete
      await stepPromise
      
      if (data.postText) {
        setGeneratedContent(data)
        setContent(data.postText)
        
        // Add final insights
        setReasoningInsights(prev => [...prev, 
          {
            type: 'engagement',
            confidence: 88,
            insight: 'Content optimized for LinkedIn engagement patterns',
            recommendation: 'Consider posting during peak professional hours'
          },
          {
            type: 'optimization',
            confidence: 90,
            insight: 'Hashtags strategically selected for reach and relevance',
            recommendation: 'Monitor hashtag performance for future optimization'
          }
        ])
        
        onContentGenerated?.(data)
      }
      
    } catch (error) {
      console.error('Content generation failed:', error)
      // Mark last step as failed
      setGenerationSteps(prev => prev.map((step, index) => 
        index === prev.length - 1 ? { ...step, status: 'failed' } : step
      ))
    } finally {
      setIsGenerating(false)
    }
  }

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'processing':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      default:
        return <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'strategy':
        return <Target className="w-4 h-4 text-purple-500" />
      case 'audience':
        return <Eye className="w-4 h-4 text-blue-500" />
      case 'engagement':
        return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'optimization':
        return <Zap className="w-4 h-4 text-yellow-500" />
      default:
        return <Lightbulb className="w-4 h-4 text-orange-500" />
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Brain className="w-6 h-6 mr-2 text-blue-600" />
              GPT-5 Enhanced Content Editor
            </h1>
            <p className="text-gray-600 mt-1">Advanced content creation with reasoning insights</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              selectedModel.includes('gpt-5') 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {AVAILABLE_MODELS.find(m => m.id === selectedModel)?.name || selectedModel}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Configuration Panel */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Configuration
              </h3>
              <button
                onClick={() => setShowReasoningPanel(!showReasoningPanel)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {showReasoningPanel ? 'Hide' : 'Show'} Reasoning
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  disabled={useOptimalRouting}
                >
                  {gpt5Models.map(model => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Verbosity</label>
                <select
                  value={verbosity}
                  onChange={(e) => setVerbosity(e.target.value as any)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  disabled={useOptimalRouting}
                >
                  <option value="low">Low - Concise</option>
                  <option value="medium">Medium - Balanced</option>
                  <option value="high">High - Detailed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reasoning</label>
                <select
                  value={reasoningEffort}
                  onChange={(e) => setReasoningEffort(e.target.value as any)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  disabled={useOptimalRouting}
                >
                  <option value="minimal">Minimal</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={useOptimalRouting}
                    onChange={(e) => setUseOptimalRouting(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">Auto-optimize</span>
                </label>
              </div>
            </div>
          </div>

          {/* Content Editor */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Content</h3>
              <button
                onClick={generateContent}
                disabled={isGenerating}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4 mr-2" />
                )}
                {isGenerating ? 'Generating...' : 'Generate with GPT-5'}
              </button>
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your content or click Generate to create content with GPT-5..."
              className="w-full h-64 border border-gray-300 rounded px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {generatedContent && (
              <div className="mt-4 space-y-3">
                {generatedContent.hashtags && generatedContent.hashtags.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Hashtags</h4>
                    <div className="flex flex-wrap gap-1">
                      {generatedContent.hashtags.map((tag: string, index: number) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {generatedContent.callToAction && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Call to Action</h4>
                    <p className="text-sm text-gray-600 italic">{generatedContent.callToAction}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Reasoning Panel */}
        {showReasoningPanel && (
          <div className="space-y-6">
            {/* Tabs */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-4">
                  <button
                    onClick={() => setActiveTab('reasoning')}
                    className={`py-3 text-sm font-medium border-b-2 ${
                      activeTab === 'reasoning'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Brain className="w-4 h-4 inline mr-1" />
                    Process
                  </button>
                  <button
                    onClick={() => setActiveTab('insights')}
                    className={`py-3 text-sm font-medium border-b-2 ${
                      activeTab === 'insights'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Lightbulb className="w-4 h-4 inline mr-1" />
                    Insights
                  </button>
                </nav>
              </div>

              <div className="p-4">
                {activeTab === 'reasoning' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Generation Process</h3>
                    
                    {generationSteps.map((step, index) => (
                      <div key={step.id} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getStepIcon(step.status)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900">{step.name}</h4>
                            {step.duration && (
                              <span className="text-xs text-gray-500 flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {step.duration}ms
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{step.description}</p>
                          {step.confidence && (
                            <div className="mt-1">
                              <div className="flex items-center justify-between text-xs">
                                <span>Confidence</span>
                                <span>{step.confidence}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                <div 
                                  className="bg-blue-600 h-1.5 rounded-full" 
                                  style={{ width: `${step.confidence}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'insights' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">AI Insights</h3>
                    
                    {reasoningInsights.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">
                        Generate content to see AI insights and recommendations
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {reasoningInsights.map((insight, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-3">
                            <div className="flex items-start space-x-2">
                              <div className="flex-shrink-0 mt-0.5">
                                {getInsightIcon(insight.type)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                    {insight.type}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {insight.confidence}% confidence
                                  </span>
                                </div>
                                <p className="text-sm text-gray-800">{insight.insight}</p>
                                {insight.recommendation && (
                                  <p className="text-sm text-blue-600 mt-1">
                                    💡 {insight.recommendation}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
