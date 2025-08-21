'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

import type { User } from '@/types/content'
import { AVAILABLE_MODELS } from '@/lib/models'
import ModelSelector from '@/components/content/ModelSelector'
import ReasoningOptions from '@/components/content/ReasoningOptions'
import ReasoningDisplay from '@/components/content/ReasoningDisplay'

type ContentItemWithDetails = {
  id: string
  title: string
  description: string
  body: string
  contentType: string
  status: string
  currentStage: string
  createdAt: string
  updatedAt: string
  createdBy: {
    id: string
    name: string | null
    email: string | null
    role: string
  }
  assignedTo?: {
    id: string
    name: string | null
    email: string | null
  } | null
  metadata: any
  feedbacks?: Array<{
    id: string
    comment: string
    createdAt: string
    createdBy: {
      id: string
      name: string | null
      email: string | null
      role: string
    }
  }>
  comments?: Array<{
    id: string
    comment: string
    createdAt: string
    createdBy: {
      id: string
      name: string | null
      email: string | null
      role: string
    }
  }>
  media?: Array<{
    id: string
    url: string
    filename: string
    contentType: string
    size: number
  }>
  stageHistory?: Array<{
    id: string
    fromStage: string
    toStage: string
    transitionedAt: string
    transitionedBy: string
    notes: string | null
    user: {
      id: string
      name: string | null
      email: string | null
    }
  }>
  idea?: {
    id: string
    title: string
    description: string
    body: string
    contentType: string
    status: string
    currentStage: string
    createdAt: string
    updatedAt: string
    createdBy: {
      id: string
      name: string | null
      email: string | null
      role: string
    }
    assignedTo?: {
      id: string
      name: string | null
      email: string | null
    } | null
    metadata: any
    feedbacks?: Array<{
      id: string
      comment: string
      createdAt: string
      createdBy: {
        id: string
        name: string | null
        email: string | null
        role: string
      }
    }>
    comments?: Array<{
      id: string
      comment: string
      createdAt: string
      createdBy: {
        id: string
        name: string | null
        email: string | null
        role: string
      }
    }>
    media?: Array<{
      id: string
      url: string
      filename: string
      contentType: string
      size: number
    }>
    stageHistory?: Array<{
      id: string
      fromStage: string
      toStage: string
      transitionedAt: string
      transitionedBy: string
      notes: string | null
      user: {
        id: string
        name: string | null
        email: string | null
      }
    }>
  }
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
  const { data: session, status } = useSession()
  const router = useRouter()
  const [contentItem, setContentItem] = useState<ContentItemWithDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [savingDraft, setSavingDraft] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
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
    if (session?.user && params.id) {
      fetchContentItem()
    }
  }, [session, params.id])

  const fetchContentItem = async () => {
    try {
      setLoading(true)
      setError('')
      console.log('Fetching content draft with ID:', params.id)
      
      const response = await fetch(`/api/drafts/${params.id}`)
      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error Response:', errorText)
        throw new Error(`Failed to fetch content draft: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('Fetched content draft data:', data)
      
      if (!data || !data.id) {
        throw new Error('Invalid content draft data received')
      }
      
      setContentItem(data)
      setContent(data.body || '')
    } catch (error) {
      console.error('Error fetching content draft:', error)
      setError(error instanceof Error ? error.message : 'Error loading content draft')
    } finally {
      setLoading(false)
    }
  }

  const generateContent = async () => {
    if (!contentItem) return
    
    setLoading(true)
    setError('')
    try {
      console.log('Generating content for:', {
        title: contentItem.idea?.title || 'Untitled',
        description: contentItem.idea?.description || 'No description',
        model: selectedModel.id,
        additionalContext
      });

      const response = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: contentItem.idea?.title || 'Untitled',
          description: contentItem.idea?.description || 'No description',
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
      await fetch(`/api/drafts/${params.id}`, {
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

  const saveDraft = async (status: 'IDEA' | 'CONTENT_REVIEW' | 'APPROVED' | 'REJECTED' | 'PUBLISHED') => {
    if (!contentItem) return;
    setSavingDraft(true);
    
    // Map ContentItemStatus to DraftStatus
    let draftStatus: string;
    switch (status) {
      case 'IDEA':
        draftStatus = 'DRAFT';
        break;
      case 'CONTENT_REVIEW':
        draftStatus = 'AWAITING_FEEDBACK';
        break;
      case 'APPROVED':
        draftStatus = 'APPROVED';
        break;
      case 'REJECTED':
        draftStatus = 'REJECTED';
        break;
      case 'PUBLISHED':
        draftStatus = 'PUBLISHED';
        break;
      default:
        draftStatus = 'DRAFT';
    }
    
    try {
      const response = await fetch(`/api/drafts/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          status: draftStatus,
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
      
      // Show success message
      setSuccessMessage(`Content saved successfully as ${status.toLowerCase()}!`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // If approved, redirect to the content review page
      if (status === 'APPROVED') {
        router.push('/content-review');
      }
    } catch (error) {
      console.error('Error saving content draft:', error);
      setError(error instanceof Error ? error.message : 'Failed to save content draft');
    } finally {
      setSavingDraft(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading session...</p>
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h2>
          <p className="text-gray-600 mb-6">You need to be signed in to access this page.</p>
          <button
            onClick={() => router.push('/auth/signin')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading content item...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="rounded-md bg-red-50 p-4 max-w-md mx-auto">
            <p className="text-red-800 mb-4">{error}</p>
            <button
              onClick={() => fetchContentItem()}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!contentItem) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="rounded-md bg-yellow-50 p-4 max-w-md mx-auto">
            <p className="text-yellow-800 mb-4">Content item not found</p>
            <button
              onClick={() => router.back()}
              className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
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
        
        <h1 className="text-2xl font-bold mb-4">Content Review</h1>
        
        {/* Original Idea Context - This is what the AI will use */}
        {contentItem.idea && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Original Idea Context
            </h2>
            <div className="space-y-3">
              <div>
                <span className="font-medium text-blue-800">Idea Title:</span>
                <p className="text-blue-900 font-semibold mt-1">{contentItem.idea.title}</p>
              </div>
              <div>
                <span className="font-medium text-blue-800">Idea Description:</span>
                <p className="text-blue-900 mt-1">{contentItem.idea.description}</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-100 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> The AI will use this idea context to generate relevant content. 
                You can add additional requirements in the "Additional Context" field below.
              </p>
            </div>
          </div>
        )}
        
        {/* Content Item Details */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Status:</span>
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                {contentItem.status}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Stage:</span>
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                {contentItem.currentStage}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Type:</span>
              <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                {contentItem.contentType}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Created:</span>
              <span className="ml-2 text-gray-600">
                {new Date(contentItem.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        
        {/* Debug Information - Remove this in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">Debug Info (Development Only):</h3>
            <div className="text-xs text-yellow-700 space-y-1">
              <div><strong>Content Item ID:</strong> {contentItem.id}</div>
              <div><strong>Has Idea Data:</strong> {contentItem.idea ? 'Yes' : 'No'}</div>
              {contentItem.idea && (
                <>
                  <div><strong>Idea ID:</strong> {contentItem.idea.id}</div>
                  <div><strong>Idea Title:</strong> {contentItem.idea.title}</div>
                  <div><strong>Idea Description:</strong> {contentItem.idea.description}</div>
                </>
              )}
              <div><strong>Content Type:</strong> {contentItem.contentType}</div>
              <div><strong>Status:</strong> {contentItem.status}</div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Content Generation Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">AI Content Generation</h2>
          
          {/* AI Context Preview */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">AI Context Preview:</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-600">Title:</span>
                <span className="ml-2 text-gray-800">{contentItem.idea?.title || 'No title available'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Description:</span>
                <span className="ml-2 text-gray-800">{contentItem.idea?.description || 'No description available'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Content Type:</span>
                <span className="ml-2 text-gray-800">{contentItem.contentType}</span>
              </div>
              {additionalContext && (
                <div>
                  <span className="font-medium text-gray-600">Additional Context:</span>
                  <span className="ml-2 text-gray-800">{additionalContext}</span>
                </div>
              )}
            </div>
            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
              <strong>Tip:</strong> The AI will generate content based on the idea context above. 
              Use the "Additional Context" field to add specific requirements or tone preferences.
            </div>
          </div>
          
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
              Additional Context & Requirements
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
              rows={4}
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              placeholder={`Add specific requirements for the AI content generation...

Examples:
• Tone: "Professional but conversational, targeting business leaders"
• Length: "Keep it under 200 words for social media"
• Focus: "Emphasize the benefits of effective naming conventions"
• Style: "Include actionable tips and examples"
• Keywords: "Must include: project management, efficiency, governance"

The AI will combine this with the idea context above to generate relevant content.`}
            />
            <p className="mt-2 text-sm text-gray-600">
              This additional context will be combined with the original idea to guide the AI content generation.
            </p>
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

          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              {successMessage}
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
              onClick={() => saveDraft('IDEA')}
              disabled={savingDraft}
              className="w-full px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
            >
              {savingDraft ? 'Saving...' : 'Save as Idea'}
            </button>
            <button
              onClick={() => saveDraft('CONTENT_REVIEW')}
              disabled={savingDraft}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {savingDraft ? 'Saving...' : 'Submit for Review'}
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