'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import type { ContentDraft, Idea, User } from '@/types/content'
import { AVAILABLE_MODELS } from '@/lib/models'
import ModelSelector from '@/components/content/ModelSelector'
import ReasoningOptions from '@/components/content/ReasoningOptions'
import ReasoningDisplay from '@/components/content/ReasoningDisplay'

type ContentDraftWithDetails = ContentDraft & {
  idea: Idea & {
    createdBy: Pick<User, 'name' | 'email'>
  }
  createdBy: Pick<User, 'name' | 'email'>
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

export default function ContentReviewDetailPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [draft, setDraft] = useState<ContentDraftWithDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [savingDraft, setSavingDraft] = useState(false)
  const [error, setError] = useState('')
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0])
  const [additionalContext, setAdditionalContext] = useState('')

  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null)
  const [content, setContent] = useState('')
  
  // Add reasoning options state
  const [includeReasoning, setIncludeReasoning] = useState(false)
  const [reasoningSummary, setReasoningSummary] = useState(false)
  const [encryptedReasoning, setEncryptedReasoning] = useState(false)
  const [showReasoning, setShowReasoning] = useState(false)

  useEffect(() => {
    fetchDraft()
  }, [params.id])

  const fetchDraft = async () => {
    try {
      const response = await fetch(`/api/content-drafts/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch draft')
      const data = await response.json()
      setDraft(data)
      setContent(data.body)
    } catch (error) {
      setError('Error loading draft')
      console.error('Error:', error)
    }
  }

  const generateContent = async () => {
    if (!draft) return
    
    setLoading(true)
    setError('')
    try {
      console.log('Generating content for:', {
        title: draft.idea.title,
        description: draft.idea.description,
        model: selectedModel.id,
        additionalContext
      });

      const response = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: draft.idea.title,
          description: draft.idea.description,
          format: 'social',
          model: selectedModel.id,
          additionalContext,
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
      setContent(data.postText || '')
      // Auto-save generated content
      await fetch(`/api/content-drafts/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          body: data.postText || '',
          metadata: {
            model: selectedModel.id,
            additionalContext,
            hashtags: data.hashtags,
            callToAction: data.callToAction,
            reasoning: data.reasoning
          }
        }),
      })
    } catch (error) {
      console.error('Error:', error)
      setError(error instanceof Error ? error.message : 'Failed to generate content. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const saveDraft = async (status: 'DRAFT' | 'AWAITING_FEEDBACK' | 'AWAITING_REVISION' | 'APPROVED' | 'REJECTED' | 'PUBLISHED') => {
    if (!draft) return;
    setSavingDraft(true);
    try {
      const response = await fetch(`/api/content-drafts/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: status,
          body: content,
          metadata: {
            model: selectedModel.id,
            additionalContext,
            hashtags: generatedContent?.hashtags,
            callToAction: generatedContent?.callToAction,
            reasoning: generatedContent?.reasoning
          }
        }),
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
      // If approved, redirect to the content review page
      if (status === 'APPROVED') {
        router.push('/content-review');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      setError(error instanceof Error ? error.message : 'Failed to save draft');
    } finally {
      setSavingDraft(false);
    }
  };



  if (!session) {
    return <div>Please sign in to access this page.</div>
  }

  if (!draft) {
    return <div>Loading...</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-red-600 hover:text-red-700 mb-4"
        >
          ← Back to Content Review
        </button>
        
        <h1 className="text-2xl font-bold mb-4">{draft.idea.title}</h1>
        <p className="text-gray-600 mb-6">{draft.idea.description}</p>
      </div>

      <div className="space-y-6">
        {/* Content Generation Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">AI Content Generation</h2>
          
          <div className="mb-6">
            <ModelSelector
              selectedModel={selectedModel.id}
              onModelChange={(modelId) => {
                const model = AVAILABLE_MODELS.find(m => m.id === modelId)
                if (model) setSelectedModel(model)
              }}
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Context
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
              rows={3}
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              placeholder="Add any specific requirements, tone preferences, or additional context for the content..."
            />
          </div>

          <button
            onClick={generateContent}
            disabled={loading}
            className="mb-6 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 flex items-center justify-center w-full"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : 'Generate with AI'}
          </button>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {generatedContent && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Post Text</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                  rows={4}
                  value={generatedContent.postText}
                  onChange={(e) => setGeneratedContent(prev => prev ? { ...prev, postText: e.target.value } : null)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hashtags</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                  value={generatedContent.hashtags.map(tag => '#' + tag).join(' ')}
                  onChange={(e) => setGeneratedContent(prev => prev ? { 
                    ...prev, 
                    hashtags: e.target.value.split(' ').filter(tag => tag.startsWith('#')).map(tag => tag.substring(1))
                  } : null)}
                  placeholder="#hashtag1 #hashtag2 #hashtag3"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Call to Action</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                  rows={2}
                  value={generatedContent.callToAction}
                  onChange={(e) => setGeneratedContent(prev => prev ? { ...prev, callToAction: e.target.value } : null)}
                />
              </div>

              {/* Reasoning Display */}
              {generatedContent?.reasoning && (
                <ReasoningDisplay
                  reasoning={generatedContent.reasoning}
                  isVisible={showReasoning}
                  onToggleVisibility={() => setShowReasoning(!showReasoning)}
                />
              )}
            </div>
          )}
        </div>

        {/* Save Actions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Save Actions</h2>
          
          <div className="space-y-3">
            <button
              onClick={() => saveDraft('DRAFT')}
              disabled={savingDraft}
              className="w-full px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
            >
              {savingDraft ? 'Saving...' : 'Save as Draft'}
            </button>
            <button
              onClick={() => saveDraft('AWAITING_FEEDBACK')}
              disabled={savingDraft}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {savingDraft ? 'Saving...' : 'Submit for Feedback'}
            </button>
            <button
              onClick={() => saveDraft('APPROVED')}
              disabled={savingDraft}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {savingDraft ? 'Saving...' : 'Approve'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 