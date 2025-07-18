'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { SparklesIcon, LightBulbIcon, ChartBarIcon } from '@heroicons/react/24/outline'

import type { Idea } from '@/types/content'
import ModelSelector from '@/components/ModelSelector'
import { AVAILABLE_MODELS } from '@/lib/models'
import ReasoningOptions from '@/components/content/ReasoningOptions'
import ReasoningDisplay from '@/components/content/ReasoningDisplay'
import AIEnhancedEditor from '@/components/editor/AIEnhancedEditor'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface GeneratedContent {
  postText: string
  hashtags: string[]
  callToAction: string
  reasoning?: {
    summary?: string
    reasoningId?: string
    encryptedContent?: string
  }
}

export default function EditContent({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isAIEnhanced = searchParams.get('ai-enhanced') === 'true'
  
  const [idea, setIdea] = useState<Idea | null>(null)
  const [loading, setLoading] = useState(false)
  const [savingDraft, setSavingDraft] = useState(false)
  const [error, setError] = useState('')
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0])
  const [additionalContext, setAdditionalContext] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null)
  
  // Add reasoning options state
  const [includeReasoning, setIncludeReasoning] = useState(false)
  const [reasoningSummary, setReasoningSummary] = useState(false)
  const [encryptedReasoning, setEncryptedReasoning] = useState(false)
  const [showReasoning, setShowReasoning] = useState(false)

  // AI Enhancement state
  const [showAIEditor, setShowAIEditor] = useState(isAIEnhanced)
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])

  useEffect(() => {
    fetchIdea()
  }, [params.id])

  const fetchIdea = async () => {
    try {
      const response = await fetch(`/api/ideas/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch idea')
      const result = await response.json()
      if (result.success) {
        setIdea(result.data)
        // Add initial system message
        setMessages([
          {
            role: 'assistant',
            content: `I'll help you create content for: "${result.data.title}"\nDescription: ${result.data.description}\n\nHow would you like to customize this content?`
          }
        ])
      } else {
        throw new Error(result.error?.message || 'Failed to fetch idea')
      }
    } catch (error) {
      setError('Error loading idea')
      console.error('Error:', error)
    }
  }

  const generateContent = async () => {
    setLoading(true)
    setError('')
    try {
      console.log('Generating content for:', {
        title: idea?.title,
        description: idea?.description,
        model: selectedModel.id,
        additionalContext
      });

      const response = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: idea?.title,
          description: idea?.description,
          format: 'social',
          model: selectedModel.id,
          additionalContext,
          conversation: messages,
          includeReasoning,
          reasoningSummary,
          encryptedReasoning
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Content generation error:', errorText)
        throw new Error(errorText)
      }

      const data = await response.json()
      console.log('Generated content:', data)

      if (!data.postText && !data.hashtags && !data.callToAction) {
        throw new Error('Generated content is empty')
      }

      setGeneratedContent(data)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `I've generated new content based on your input. Here's what I created:

Post Text:
${data.postText || ''}

Hashtags:
${(data.hashtags || []).map((tag: string) => '#' + tag).join(' ')}

Call to Action:
${data.callToAction || ''}

Would you like me to modify anything about this content?`
      }])
    } catch (error) {
      console.error('Error:', error)
      setError(error instanceof Error ? error.message : 'Failed to generate content. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const saveDraft = async (status: 'DRAFT' | 'AWAITING_REVISION' | 'AWAITING_FEEDBACK' | 'APPROVED' | 'REJECTED' | 'PUBLISHED') => {
    if (!generatedContent) return;
    
    setSavingDraft(true);
    try {
      const response = await fetch('/api/content-drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ideaId: params.id,
          status: status,
          contentType: 'SOCIAL_MEDIA_POST',
          body: generatedContent.postText,
          metadata: {
            model: selectedModel.id,
            additionalContext,
            conversation: messages,
            hashtags: generatedContent.hashtags,
            callToAction: generatedContent.callToAction,
            reasoning: generatedContent.reasoning
          }
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      // If approved, redirect to the idea page
      if (status === 'APPROVED') {
        router.push(`/ideas/${params.id}`);
      } else {
        // Just show a success message for drafts
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Content has been saved as a draft. You can continue editing or submit for approval when ready.'
        }]);
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      setError(error instanceof Error ? error.message : 'Failed to save draft');
    } finally {
      setSavingDraft(false);
    }
  };

  const loadAISuggestions = async () => {
    if (!idea) return
    
    try {
      const response = await fetch('/api/ai/content-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: idea.title,
          description: idea.description,
          contentType: idea.contentType
        })
      })

      if (response.ok) {
        const data = await response.json()
        setAiSuggestions(data.suggestions || [])
      }
    } catch (error) {
      console.error('Failed to load AI suggestions:', error)
    }
  }

  useEffect(() => {
    if (idea && showAIEditor) {
      loadAISuggestions()
    }
  }, [idea, showAIEditor])

  if (!session) {
    return <div>Please sign in to access this page.</div>
  }

  if (!idea) {
    return <div>Loading...</div>
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">{idea.title}</h1>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowAIEditor(!showAIEditor)}
                className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
                  showAIEditor 
                    ? 'border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100' 
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                <SparklesIcon className="mr-2 h-4 w-4" />
                {showAIEditor ? 'AI Enhanced' : 'Enable AI'}
              </button>
              <Link
                href={`/create-content/${idea.id}/drafts`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                View All Drafts
              </Link>
            </div>
          </div>
          <p className="mt-1 text-sm text-gray-600">{idea.description}</p>
        </div>

        {/* AI Enhancement Banner */}
        {showAIEditor && (
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <SparklesIcon className="h-6 w-6 text-blue-600" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">AI-Enhanced Content Creation</h3>
                  <p className="text-sm text-gray-600">Get real-time AI suggestions, content optimization, and performance insights</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Suggestions Panel */}
        {showAIEditor && aiSuggestions.length > 0 && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <LightBulbIcon className="h-5 w-5 text-yellow-600" />
              <h4 className="font-medium text-gray-900">AI Content Suggestions</h4>
            </div>
            <div className="space-y-2">
              {aiSuggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start space-x-2 text-sm">
                  <span className="text-yellow-600">•</span>
                  <span className="text-gray-700">{suggestion}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {showAIEditor ? (
          /* AI-Enhanced Editor */
          <div className="space-y-6">
            <AIEnhancedEditor
              content={generatedContent?.postText || ''}
              contentType="social"
              onContentChange={(content) => {
                setGeneratedContent(prev => ({
                  ...prev,
                  postText: content,
                  hashtags: prev?.hashtags || [],
                  callToAction: prev?.callToAction || ''
                }))
              }}
              onSave={() => saveDraft('DRAFT')}
            />
          </div>
        ) : (
          /* Traditional Editor */
          <div className="space-y-6">
            <div className="mb-6">
              <ModelSelector
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
                models={AVAILABLE_MODELS}
              />
            </div>

            {/* Reasoning Options */}
            <div className="mb-6">
              <ReasoningOptions
                selectedModel={selectedModel.id}
                includeReasoning={includeReasoning}
                reasoningSummary={reasoningSummary}
                encryptedReasoning={encryptedReasoning}
                onIncludeReasoningChange={setIncludeReasoning}
                onReasoningSummaryChange={setReasoningSummary}
                onEncryptedReasoningChange={setEncryptedReasoning}
              />
            </div>

            <div className="mb-6">
              <label htmlFor="additionalContext" className="block text-sm font-medium text-gray-700">
                Additional Context
              </label>
              <div className="mt-1">
                <textarea
                  id="additionalContext"
                  name="additionalContext"
                  rows={3}
                  className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                  placeholder="Add any additional context or specific requirements..."
                />
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 rounded-md">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-6">
              <button
                onClick={generateContent}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {loading ? 'Generating...' : 'Generate Content'}
              </button>
            </div>

            <div className="mb-6 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${
                    message.role === 'assistant' ? 'bg-gray-100' : 'bg-red-50'
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm text-gray-900">
                    {message.content}
                  </p>
                </div>
              ))}
            </div>

            {generatedContent && (
              <div className="mb-6 p-4 bg-white rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-2">Generated Content</h2>
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700">Post Text</h3>
                  <p className="mt-1 text-gray-900">{generatedContent.postText || ''}</p>
                </div>
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700">Hashtags</h3>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {(generatedContent.hashtags || []).map((tag: string, index: number) => (
                      <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700">Call to Action</h3>
                  <p className="mt-1 text-gray-900">{generatedContent.callToAction || ''}</p>
                </div>

                {/* Reasoning Display */}
                {generatedContent.reasoning && (
                  <ReasoningDisplay
                    reasoning={generatedContent.reasoning}
                    isVisible={showReasoning}
                    onToggleVisibility={() => setShowReasoning(!showReasoning)}
                  />
                )}

                <div className="mt-8 border-t pt-8">
      
  
                </div>

                <div className="mt-4 flex gap-4">
                  <button
                    onClick={() => saveDraft('DRAFT')}
                    disabled={savingDraft}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
                  >
                    {savingDraft ? 'Saving...' : 'Save as Draft'}
                  </button>
                  <button
                    onClick={() => saveDraft('AWAITING_FEEDBACK')}
                    disabled={savingDraft}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {savingDraft ? 'Saving...' : 'Submit for Approval'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 