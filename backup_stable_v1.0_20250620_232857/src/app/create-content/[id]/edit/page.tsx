'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Idea } from '@prisma/client'
import ModelSelector from '@/components/ModelSelector'
import { AVAILABLE_MODELS } from '@/lib/models'
import Link from 'next/link'
import VisualGenerator from '@/components/visuals/VisualGenerator'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface GeneratedContent {
  postText: string
  hashtags: string[]
  callToAction: string
}

export default function EditContent({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [idea, setIdea] = useState<Idea | null>(null)
  const [loading, setLoading] = useState(false)
  const [savingDraft, setSavingDraft] = useState(false)
  const [error, setError] = useState('')
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0])
  const [additionalContext, setAdditionalContext] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null)

  useEffect(() => {
    fetchIdea()
  }, [params.id])

  const fetchIdea = async () => {
    try {
      const response = await fetch(`/api/ideas/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch idea')
      const data = await response.json()
      setIdea(data)
      // Add initial system message
      setMessages([
        {
          role: 'assistant',
          content: `I'll help you create content for: "${data.title}"\nDescription: ${data.description}\n\nHow would you like to customize this content?`
        }
      ])
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
          conversation: messages
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

  const saveDraft = async (status: 'PENDING_FIRST_REVIEW' | 'NEEDS_REVISION' | 'PENDING_FINAL_APPROVAL' | 'APPROVED_FOR_PUBLISHING' | 'REJECTED') => {
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
            callToAction: generatedContent.callToAction
          }
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      // If approved, redirect to the idea page
      if (status === 'APPROVED_FOR_PUBLISHING') {
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
            <Link
              href={`/create-content/${idea.id}/drafts`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              View All Drafts
            </Link>
          </div>
          <p className="mt-1 text-sm text-gray-600">{idea.description}</p>
        </div>

        <div className="mb-6">
          <ModelSelector
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            models={AVAILABLE_MODELS}
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
            <p className="text-sm text-red-700">{error}</p>
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

            <div className="mt-8 border-t pt-8">
              <h2 className="text-lg font-semibold mb-4">Generate Visual Content</h2>
              <VisualGenerator ideaId={params.id} />
            </div>

            <div className="mt-4 flex gap-4">
              <button
                onClick={() => saveDraft('PENDING_FIRST_REVIEW')}
                disabled={savingDraft}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
              >
                {savingDraft ? 'Saving...' : 'Save as Draft'}
              </button>
              <button
                onClick={() => saveDraft('PENDING_FINAL_APPROVAL')}
                disabled={savingDraft}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {savingDraft ? 'Saving...' : 'Submit for Approval'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 