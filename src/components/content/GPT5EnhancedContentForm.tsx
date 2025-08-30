'use client'

import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  Wand2, 
  Sparkles, 
  Target, 
  TrendingUp, 
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Loader2,
  Copy,
  RefreshCw,
  Save,
  Send,
  FileText,
  MessageSquare,
  Mail,
  Globe
} from 'lucide-react'

import { useInterface } from '@/hooks/useInterface'
import Button from '@/components/ui/common/Button'
import Badge from '@/components/ui/common/Badge'
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/layout/Card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/common/Tabs'

interface GPT5EnhancedContentFormProps {
  onSubmit?: (data: EnhancedContentFormData) => void
  onCancel?: () => void
  initialData?: Partial<EnhancedContentFormData>
}

export interface EnhancedContentFormData {
  title: string
  description: string
  contentType: 'BLOG_POST' | 'SOCIAL_MEDIA' | 'NEWSLETTER' | 'WEBSITE_CONTENT'
  mediaType: 'TEXT' | 'IMAGE' | 'VIDEO' | 'MIXED'
  targetAudience: string
  keywords: string[]
  aiAssistance: boolean
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  deadline?: Date
  notes: string
  // GPT-5 specific options
  gpt5Model?: 'gpt-5' | 'gpt-5-mini' | 'gpt-5-nano' | 'auto'
  gpt5Verbosity?: 'low' | 'medium' | 'high'
  gpt5ReasoningEffort?: 'minimal' | 'low' | 'medium' | 'high'
  gpt5MaxOutputTokens?: number
  useOptimalRouting?: boolean
  taskComplexity?: 'simple' | 'medium' | 'complex'
  urgency?: 'low' | 'standard' | 'high'
  budget?: 'cost-effective' | 'balanced' | 'premium'
}

interface GeneratedContent {
  postText: string
  hashtags: string[]
  callToAction?: string
  reasoning?: string
  confidence?: number
  modelUsed?: string
  costEstimate?: number
}

export default function GPT5EnhancedContentForm({
  onSubmit,
  onCancel,
  initialData = {}
}: GPT5EnhancedContentFormProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const interfaceContext = useInterface()
  const [activeTab, setActiveTab] = useState('form')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null)
  const [generationError, setGenerationError] = useState<string | null>(null)

  const [formData, setFormData] = useState<EnhancedContentFormData>({
    title: '',
    description: '',
    contentType: 'BLOG_POST',
    mediaType: 'TEXT',
    targetAudience: '',
    keywords: [],
    aiAssistance: true,
    priority: 'MEDIUM',
    deadline: undefined,
    notes: '',
    // GPT-5 defaults
    gpt5Model: 'auto',
    gpt5Verbosity: 'medium',
    gpt5ReasoningEffort: 'medium',
    gpt5MaxOutputTokens: 2000,
    useOptimalRouting: true,
    taskComplexity: 'medium',
    urgency: 'standard',
    budget: 'balanced',
    ...initialData
  })

  const isCreativeUser = interfaceContext.isCreative
  const isClientUser = interfaceContext.isClient
  const isAdminUser = interfaceContext.isAdmin

  const handleInputChange = (field: keyof EnhancedContentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addKeyword = (keyword: string) => {
    if (keyword.trim() && !formData.keywords.includes(keyword.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keyword.trim()]
      }))
    }
  }

  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }))
  }

  const generateContent = async () => {
    if (!formData.title || !formData.description) {
      setGenerationError('Please provide a title and description first')
      return
    }

    setIsGenerating(true)
    setGenerationError(null)
    setGeneratedContent(null)

    try {
      const response = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          format: formData.contentType.toLowerCase().replace('_', '-'),
          model: formData.gpt5Model === 'auto' ? undefined : formData.gpt5Model,
          verbosity: formData.gpt5Verbosity,
          reasoningEffort: formData.gpt5ReasoningEffort,
          maxOutputTokens: formData.gpt5MaxOutputTokens,
          useOptimalRouting: formData.useOptimalRouting,
          taskComplexity: formData.taskComplexity,
          urgency: formData.urgency,
          budget: formData.budget,
          additionalContext: `Target Audience: ${formData.targetAudience}\nKeywords: ${formData.keywords.join(', ')}\nNotes: ${formData.notes}`
        })
      })

      const data = await response.json()

      if (data.success) {
        setGeneratedContent(data)
        setActiveTab('preview')
      } else {
        setGenerationError(data.error || 'Failed to generate content')
      }
    } catch (error) {
      console.error('Content generation failed:', error)
      setGenerationError('Network error occurred')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (onSubmit) {
      onSubmit(formData)
    } else {
      // Save to content drafts
      try {
        const response = await fetch('/api/content-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            body: generatedContent?.postText || formData.description,
            contentType: formData.contentType.toLowerCase().replace('_', '-'),
            metadata: {
              ...formData,
              generatedContent,
              aiEnhanced: true,
              createdAt: new Date().toISOString()
            }
          })
        })

        if (response.ok) {
          const savedDraft = await response.json()
          router.push(`/content-review/${savedDraft.id}`)
        }
      } catch (error) {
        console.error('Failed to save draft:', error)
      }
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Create AI-Enhanced Content
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Role:</span>
              <Badge variant={isCreativeUser ? 'default' : isClientUser ? 'default' : 'secondary'}>
                {isCreativeUser ? 'Creative' : isClientUser ? 'Client' : 'Admin'}
              </Badge>
              <span>•</span>
              <span>Powered by GPT-5</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-sm text-blue-600">
              <Wand2 className="w-4 h-4" />
              <span>AI Ready</span>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue={activeTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="form">Content Details</TabsTrigger>
          <TabsTrigger value="preview">
            AI Preview
          </TabsTrigger>
          <TabsTrigger value="settings">AI Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="form" className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter content title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content Type *
                </label>
                <select
                  value={formData.contentType}
                  onChange={(e) => handleInputChange('contentType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="BLOG_POST">Blog Post</option>
                  <option value="SOCIAL_MEDIA">Social Media</option>
                  <option value="NEWSLETTER">Newsletter</option>
                  <option value="WEBSITE_CONTENT">Website Content</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the content you want to create..."
                required
              />
            </div>

            {/* Target Audience & Keywords */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Audience
                </label>
                <input
                  type="text"
                  value={formData.targetAudience}
                  onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Tech professionals, 25-40 years old"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Keywords
                </label>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {formData.keywords.map((keyword, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeKeyword(keyword)}>
                        {keyword} ×
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add keyword"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addKeyword(e.currentTarget.value)
                          e.currentTarget.value = ''
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        const input = document.querySelector('input[placeholder="Add keyword"]') as HTMLInputElement
                        if (input) {
                          addKeyword(input.value)
                          input.value = ''
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Creative User Features */}
            {isCreativeUser && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Media Type
                    </label>
                    <select
                      value={formData.mediaType}
                      onChange={(e) => handleInputChange('mediaType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="TEXT">Text Only</option>
                      <option value="IMAGE">Image</option>
                      <option value="VIDEO">Video</option>
                      <option value="MIXED">Mixed Media</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority Level
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => handleInputChange('priority', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Any specific requirements, brand guidelines, or creative direction..."
                  />
                </div>
              </>
            )}

            {/* Form Actions */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setActiveTab('settings')}
                >
                  AI Settings
                </Button>
              </div>
              
              <Button
                type="button"
                onClick={generateContent}
                disabled={isGenerating || !formData.title || !formData.description}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate with AI
                  </>
                )}
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="preview" className="p-6">
          {generatedContent ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">AI-Generated Content</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Model: {generatedContent.modelUsed || 'GPT-5'}</span>
                  {generatedContent.confidence && (
                    <>
                      <span>•</span>
                      <span>Confidence: {Math.round(generatedContent.confidence * 100)}%</span>
                    </>
                  )}
                  {generatedContent.costEstimate && (
                    <>
                      <span>•</span>
                      <span>Est. Cost: ${generatedContent.costEstimate.toFixed(4)}</span>
                    </>
                  )}
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Generated Content
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 min-h-[200px]">
                        <p className="whitespace-pre-wrap text-gray-900">{generatedContent.postText}</p>
                      </div>
                      <div className="flex justify-end mt-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(generatedContent.postText)}
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          Copy
                        </Button>
                      </div>
                    </div>

                    {generatedContent.hashtags && generatedContent.hashtags.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Hashtags</label>
                        <div className="flex flex-wrap gap-2">
                          {generatedContent.hashtags.map((tag, index) => (
                            <Badge key={index} variant="secondary">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {generatedContent.callToAction && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Call to Action</label>
                        <p className="text-gray-900">{generatedContent.callToAction}</p>
                      </div>
                    )}

                    {generatedContent.reasoning && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">AI Reasoning</label>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-sm text-blue-900">{generatedContent.reasoning}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab('form')}
                >
                  Back to Form
                </Button>
                
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={generateContent}
                    disabled={isGenerating}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerate
                  </Button>
                  
                  <Button
                    type="submit"
                    onClick={handleSubmit}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Content
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Wand2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Content Generated Yet</h3>
              <p className="text-gray-600 mb-4">Fill out the form and click "Generate with AI" to create content</p>
              <Button onClick={() => setActiveTab('form')}>
                Go to Form
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">GPT-5 AI Configuration</h3>
              <p className="text-gray-600 mb-6">
                Configure how the AI should generate your content. Use optimal routing for automatic model selection,
                or customize specific parameters for more control.
              </p>
            </div>

            {/* Basic GPT-5 Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI Model
                </label>
                <select
                  value={formData.gpt5Model}
                  onChange={(e) => handleInputChange('gpt5Model', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="auto">Auto-select (Recommended)</option>
                  <option value="gpt-5">GPT-5 (Full Power)</option>
                  <option value="gpt-5-mini">GPT-5 Mini (Balanced)</option>
                  <option value="gpt-5-nano">GPT-5 Nano (Fast & Cost-effective)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Auto-select chooses the best model based on your content complexity and budget
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Output Detail
                </label>
                <select
                  value={formData.gpt5Verbosity}
                  onChange={(e) => handleInputChange('gpt5Verbosity', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Concise</option>
                  <option value="medium">Balanced</option>
                  <option value="high">Detailed</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Controls how detailed and verbose the AI output should be
                </p>
              </div>
            </div>

            {/* Optimal Routing Toggle */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="useOptimalRouting"
                  checked={formData.useOptimalRouting}
                  onChange={(e) => handleInputChange('useOptimalRouting', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-blue-300 rounded"
                />
                <div>
                  <label htmlFor="useOptimalRouting" className="text-sm font-medium text-blue-900">
                    Use Optimal AI Model Routing
                  </label>
                  <p className="text-xs text-blue-700 mt-1">
                    Automatically select the best GPT-5 model based on task complexity, urgency, and budget
                  </p>
                </div>
              </div>
            </div>

            {/* Advanced Options */}
            {!formData.useOptimalRouting && (
              <div className="space-y-6 pt-4 border-t border-gray-200">
                <h4 className="text-md font-medium text-gray-900">Advanced Configuration</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reasoning Effort
                    </label>
                    <select
                      value={formData.gpt5ReasoningEffort}
                      onChange={(e) => handleInputChange('gpt5ReasoningEffort', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="minimal">Minimal (Fast)</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High (Thorough)</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Higher effort = more thorough reasoning but slower generation
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Output Length
                    </label>
                    <input
                      type="number"
                      value={formData.gpt5MaxOutputTokens}
                      onChange={(e) => handleInputChange('gpt5MaxOutputTokens', parseInt(e.target.value))}
                      min="100"
                      max="128000"
                      step="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="2000"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Maximum tokens in the generated content (100-128,000)
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Task Complexity
                    </label>
                    <select
                      value={formData.taskComplexity}
                      onChange={(e) => handleInputChange('taskComplexity', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="simple">Simple</option>
                      <option value="medium">Medium</option>
                      <option value="complex">Complex</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Urgency
                    </label>
                    <select
                      value={formData.urgency}
                      onChange={(e) => handleInputChange('urgency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="standard">Standard</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Budget Preference
                    </label>
                    <select
                      value={formData.budget}
                      onChange={(e) => handleInputChange('budget', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="cost-effective">Cost-effective</option>
                      <option value="balanced">Balanced</option>
                      <option value="premium">Premium</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveTab('form')}
              >
                Back to Form
              </Button>
              
              <Button
                type="button"
                onClick={() => setActiveTab('form')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Apply Settings
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {generationError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mx-6 mb-6">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-800">{generationError}</span>
          </div>
        </div>
      )}
    </div>
  )
}
