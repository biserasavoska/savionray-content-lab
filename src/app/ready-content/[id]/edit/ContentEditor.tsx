'use client'

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import MediaUpload from './MediaUpload'
import ErrorBoundary from '@/components/ErrorBoundary'
import ModelSelector from '@/components/content/ModelSelector'
import { AVAILABLE_MODELS } from '@/lib/models'

const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
})

interface Creator {
  name: string | null
  email: string | null
}

interface Feedback {
  id: string
  comment: string
  createdAt: Date | string
  createdBy: Creator
}

type SocialPlatform = 'linkedin' | 'twitter' | 'instagram' | 'facebook';

interface ContentEditorProps {
  ideaId: string
  contentDraftId: string
  initialContent: string
  feedbacks: Feedback[]
  idea: {
    title: string
    description: string
  }
}

function ContentEditorInner({
  ideaId,
  contentDraftId,
  initialContent,
  feedbacks,
  idea,
}: ContentEditorProps) {
  const router = useRouter()
  const [content, setContent] = useState(initialContent)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform>('linkedin')
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0].id)

  const handleSave = useCallback(async () => {
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch(`/api/drafts/${contentDraftId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          body: content,
          contentType: selectedPlatform || 'social-media',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save content')
      }

      router.refresh()
    } catch (error) {
      console.error('Error saving content:', error)
      setError('Failed to save content. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }, [content, contentDraftId, router, selectedPlatform])

  const handleGenerateContent = useCallback(async () => {
    setIsGenerating(true)
    setError('')

    try {
      const response = await fetch('/api/content/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: idea.title,
          description: idea.description,
          format: selectedPlatform,
          model: selectedModel,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate content')
      }

      const data = await response.json()
      
      // Clean up the content and remove any ### markers
      const cleanPostText = data.content.postText.replace(/###/g, '').trim()
      const cleanHashtags = data.content.hashtags.map((tag: string) => `#${tag}`).join(' ').replace(/###/g, '').trim()
      const cleanCallToAction = data.content.callToAction.replace(/###/g, '').trim()
      
      // Format the content for the editor with minimal spacing
      const formattedContent = `<div class="generated-content">
<h2 class="text-xl font-semibold mb-4">Generated Content for ${selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)}</h2>
<div class="mb-4">
  <div class="font-medium mb-2">Post Text:</div>
  <div class="bg-gray-50 p-4 rounded-lg">${cleanPostText}</div>
</div>
<div class="mb-4">
  <div class="font-medium mb-2">Hashtags:</div>
  <div class="bg-gray-50 p-4 rounded-lg">${cleanHashtags}</div>
</div>
<div class="mb-4">
  <div class="font-medium mb-2">Call to Action:</div>
  <div class="bg-gray-50 p-4 rounded-lg">${cleanCallToAction}</div>
</div>
</div>`

      setContent(formattedContent)
    } catch (error) {
      console.error('Error generating content:', error)
      setError('Failed to generate content. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }, [idea.title, idea.description, selectedPlatform, selectedModel])

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-4 mb-4">
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value as SocialPlatform)}
            className="rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
          >
            <option value="linkedin">LinkedIn</option>
            <option value="twitter">Twitter</option>
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
          </select>

          <button
            onClick={handleGenerateContent}
            disabled={isGenerating}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              'Generate with AI'
            )}
          </button>
        </div>

        <ModelSelector
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
        />
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="prose max-w-none">
        <ReactQuill
          value={content}
          onChange={setContent}
          modules={{
            toolbar: [
              [{ header: [1, 2, false] }],
              ['bold', 'italic', 'underline', 'strike'],
              [{ list: 'ordered' }, { list: 'bullet' }],
              ['link', 'clean'],
            ],
          }}
          className="min-h-[300px] [&_.ql-editor]:pt-0"
        />
      </div>

      <div className="flex justify-end space-x-4">
        <button
          onClick={handleSave}
          disabled={isSubmitting}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            'Save Draft'
          )}
        </button>
      </div>

      <MediaUpload contentDraftId={contentDraftId} />

      {feedbacks.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900">Feedback History</h3>
          <div className="mt-4 space-y-4">
            {feedbacks.map((feedback) => (
              <div key={feedback.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    {feedback.createdBy.name || feedback.createdBy.email}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(feedback.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600">{feedback.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ContentEditor(props: ContentEditorProps) {
  return (
    <ErrorBoundary>
      <ContentEditorInner {...props} />
    </ErrorBoundary>
  )
} 