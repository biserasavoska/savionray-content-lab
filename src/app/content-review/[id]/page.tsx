'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useOrganization } from '@/lib/contexts/OrganizationContext'
import SimpleRichTextEditor from '@/components/ui/SimpleRichTextEditor'


import type { User } from '@/types/content'
import { AVAILABLE_MODELS } from '@/lib/models'
import {
  Button,
  StatusBadge,
  PageLayout,
  PageHeader,
  PageContent,
  PageSection,
  Breadcrumbs,
  Textarea,
  Input,
  ErrorDisplay
} from '@/components/ui/common'

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
  }
  Idea?: {
    id: string
    title: string
    description: string
    body: string
    contentType: string
    status: string
    currentStage: string
    createdAt: string
    updatedAt: string
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
  const { currentOrganization } = useOrganization()
  const [contentItem, setContentItem] = useState<ContentItemWithDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [savingDraft, setSavingDraft] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0])
  const [additionalContext, setAdditionalContext] = useState('')

  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null)
  const [content, setContent] = useState('')
  
  // Manual content creation state
  const [manualContent, setManualContent] = useState('')
  const [isManualMode, setIsManualMode] = useState(true)

  useEffect(() => {
    if (session?.user && params.id && currentOrganization) {
      fetchContentItem()
    }
  }, [session, params.id, currentOrganization])

  const fetchContentItem = async () => {
    try {
      setLoading(true)
      setError('')
      const headers: HeadersInit = {}
      if (currentOrganization?.id) {
        headers['x-selected-organization'] = currentOrganization.id
      }
      
      const response = await fetch(`/api/drafts/${params.id}`, {
        headers
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error Response:', errorText)
        
        if (response.status === 404) {
          throw new Error('Content draft not found. It may have been deleted or you may not have permission to view it.')
        } else if (response.status === 401) {
          throw new Error('You are not authorized to view this content draft.')
        } else if (response.status === 403) {
          throw new Error('Access denied. You do not have permission to view this content draft.')
        } else {
          throw new Error(`Failed to fetch content draft: ${response.status} ${response.statusText}`)
        }
      }
      
      const data = await response.json()
      
      if (!data || !data.id) {
        throw new Error('Invalid content draft data received')
      }
      
      // Debug: Log the received data to understand the structure
      console.log('Received content draft data:', data)
      
      setContentItem(data)
      setContent(data.body || '')
    } catch (error) {
      console.error('Error fetching content draft:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error loading content draft'
      setError(errorMessage)
      
      // If it's a 404 error, redirect to content review list after a delay
      if (errorMessage.includes('not found')) {
        setTimeout(() => {
          router.push('/content-review')
        }, 3000)
      }
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
        title: contentItem.idea?.title || contentItem.Idea?.title || 'Untitled',
        description: contentItem.idea?.description || contentItem.Idea?.description || 'No description',
        model: selectedModel.id,
        additionalContext
      });

      const response = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: contentItem.idea?.title || contentItem.Idea?.title || 'Untitled',
          description: contentItem.idea?.description || contentItem.Idea?.description || 'No description',
          format: 'social',
          model: selectedModel.id,
          additionalContext,
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
      const autoSaveHeaders: HeadersInit = { 'Content-Type': 'application/json' }
      if (currentOrganization?.id) {
        autoSaveHeaders['x-selected-organization'] = currentOrganization.id
      }
      
      await fetch(`/api/drafts/${params.id}`, {
        method: 'PUT',
        headers: autoSaveHeaders,
        body: JSON.stringify({
          body: data.postText || '',
          metadata: {
            model: selectedModel.id,
            additionalContext
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
      const headers: HeadersInit = { 'Content-Type': 'application/json' }
      if (currentOrganization?.id) {
        headers['x-selected-organization'] = currentOrganization.id
      }
      
      const response = await fetch(`/api/drafts/${params.id}`, {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          status: draftStatus,
          body: content,
          metadata: {
            model: selectedModel.id,
            additionalContext
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
      <PageLayout>
        <PageContent>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </PageContent>
      </PageLayout>
    )
  }

  if (!session) {
    router.push('/auth/signin')
    return null
  }

  if (!contentItem) {
    return (
      <PageLayout>
        <PageContent>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="rounded-md bg-yellow-50 p-4 max-w-md mx-auto">
                <p className="text-yellow-800 mb-4">Content item not found</p>
                <Button onClick={() => router.back()} variant="outline">
                  Go Back
                </Button>
              </div>
            </div>
          </div>
        </PageContent>
      </PageLayout>
    )
  }

  const breadcrumbItems = [
    { href: '/', children: 'Home' },
    { href: '/content-review', children: 'Content Creation' },
    { href: `/content-review/${params.id}`, children: 'Content Details' }
  ]

  return (
    <PageLayout>
      <PageHeader
        title="Content Creation"
        breadcrumbs={<Breadcrumbs items={breadcrumbItems} />}
        actions={
          <Button onClick={() => router.back()} variant="outline">
            ← Back to Content Review
          </Button>
        }
      />

      <PageContent>
        {/* Original Idea Context - This is what the AI will use */}
        {contentItem.idea && (
          <PageSection 
            title="Original Idea Context"
            subtitle="This is what the AI will use to generate content"
            className="mb-6"
          >
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
          </PageSection>
        )}

        {/* Context Section */}
        <PageSection title="Context" className="mb-6">

          {/* Idea Details */}
          <div className="mb-6">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title:</label>
                    <p className="text-sm text-gray-900 font-semibold">{contentItem.idea?.title || contentItem.Idea?.title || 'No title available'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description:</label>
                    <p className="text-sm text-gray-900">{contentItem.idea?.description || contentItem.Idea?.description || 'No description available'}</p>
                  </div>
                </div>
                
                {/* Right Column */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Content Type:</label>
                    <p className="text-sm text-gray-900">{contentItem.contentType || 'Not specified'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Media Type:</label>
                    <p className="text-sm text-gray-900">{contentItem.metadata?.mediaType || 'Not specified'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Publishing Date & Time:</label>
                    <p className="text-sm text-gray-900">{contentItem.metadata?.publishingDate ? new Date(contentItem.metadata.publishingDate).toLocaleString() : 'Not scheduled'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Feedback:</label>
                    <div className="text-sm text-gray-900">
                      {contentItem.feedbacks && contentItem.feedbacks.length > 0 ? (
                        <div className="space-y-2">
                          {contentItem.feedbacks.map((feedback, index) => (
                            <div key={feedback.id} className="border-l-2 border-blue-200 pl-3">
                              <p className="font-medium">{feedback.comment}</p>
                              <p className="text-xs text-gray-500">
                                By {feedback.createdBy.name || feedback.createdBy.email} on {new Date(feedback.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">No feedback yet</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Current Post Content Display */}
          <div className="mb-6">
            <div className="mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Current Post Content</h3>
            </div>
            <SimpleRichTextEditor
              content={content}
              onContentChange={setContent}
              placeholder="Your post content will appear here after generation or manual input..."
              className="mb-3"
            />
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Edit directly here or use AI generation/manual editor below
              </p>
              <div className="text-xs text-gray-400">
                {content.length} characters
              </div>
            </div>
          </div>

          {/* Additional Context */}
          <div className="mb-6">
            <Textarea
              label="Additional Context & Requirements"
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              placeholder=""
              rows={4}
            />
          </div>

          {/* AI Model Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              AI Model
            </label>
            <select
              value={selectedModel.id}
              onChange={(e) => {
                const model = AVAILABLE_MODELS.find(m => m.id === e.target.value)
                if (model) setSelectedModel(model)
              }}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              {AVAILABLE_MODELS.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>

          <Button
            onClick={generateContent}
            disabled={loading}
            loading={loading}
            variant="default"
          >
            {loading ? 'Generating...' : 'Generate'}
          </Button>

          {error && (
            <ErrorDisplay
              title="Generation Error"
              message={error}
              variant="destructive"
            />
          )}

          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              {successMessage}
            </div>
          )}

          {generatedContent && (
            <div className="space-y-4 mt-6">
              <div>
                <Textarea
                  label="Post Text"
                  value={generatedContent.postText}
                  onChange={(e) => {
                    setGeneratedContent(prev => prev ? { ...prev, postText: e.target.value } : null)
                    setContent(e.target.value) // Also update main content display
                  }}
                  rows={4}
                />
              </div>
            </div>
          )}
        </PageSection>

        {/* Write Manually Section */}
        <PageSection title="Write Manually" className="mb-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Write your content manually using the rich text editor below
              </p>
              <Button
                onClick={() => setIsManualMode(!isManualMode)}
                variant={isManualMode ? "default" : "outline"}
                size="sm"
              >
                {isManualMode ? 'Hide Editor' : 'Show Editor'}
              </Button>
            </div>

            {isManualMode && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Post Content
                  </label>
                  <SimpleRichTextEditor
                    content={manualContent}
                    onContentChange={setManualContent}
                    placeholder="Write your post content here..."
                  />
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={() => {
                      setContent(manualContent)
                      setGeneratedContent({
                        postText: manualContent,
                        hashtags: [],
                        callToAction: ''
                      })
                      setSuccessMessage('Manual content applied successfully!')
                      setTimeout(() => setSuccessMessage(''), 3000)
                    }}
                    variant="default"
                    disabled={!manualContent.trim()}
                  >
                    Apply Manual Content
                  </Button>
                  
                  <Button
                    onClick={() => {
                      setManualContent('')
                    }}
                    variant="outline"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            )}
          </div>
        </PageSection>

        {/* Save Actions */}
        <PageSection title="Save Actions">
          <div className="space-y-3">
            <Button
              onClick={() => saveDraft('IDEA')}
              disabled={savingDraft}
              variant="outline"
            >
              {savingDraft ? 'Saving...' : 'Save as Idea'}
            </Button>
            <Button
              onClick={() => saveDraft('CONTENT_REVIEW')}
              disabled={savingDraft}
              variant="default"
            >
              {savingDraft ? 'Saving...' : 'Submit for Review'}
            </Button>
            <Button
              onClick={() => saveDraft('APPROVED')}
              disabled={savingDraft}
              variant="secondary"
            >
              {savingDraft ? 'Saving...' : 'Approve'}
            </Button>
          </div>
        </PageSection>
      </PageContent>
    </PageLayout>
  )
} 