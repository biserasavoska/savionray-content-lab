'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Idea } from '@prisma/client'
import ModelSelector from '@/components/ModelSelector'
import { AVAILABLE_MODELS } from '@/lib/models'

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

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return

    const userMessage = currentMessage.trim()
    setCurrentMessage('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])

    // Add thinking message
    setMessages(prev => [...prev, { role: 'assistant', content: 'Thinking...' }])

    try {
      const response = await fetch('/api/content/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversation: messages,
          idea: {
            title: idea?.title,
            description: idea?.description
          },
          model: selectedModel.id
        }),
      })

      if (!response.ok) throw new Error('Failed to get response')
      const data = await response.json()

      // Replace thinking message with actual response
      setMessages(prev => [...prev.slice(0, -1), { role: 'assistant', content: data.message }])

      // If the response includes new content, update it
      if (data.content) {
        setGeneratedContent(data.content)
      }
    } catch (error) {
      setError('Failed to get response. Please try again.')
      console.error('Error:', error)
      // Remove thinking message on error
      setMessages(prev => prev.slice(0, -1))
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
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{idea.title}</h1>
      <p className="text-gray-600 mb-6">{idea.description}</p>

      <div className="mb-6">
        <ModelSelector
          models={AVAILABLE_MODELS}
          selectedModel={selectedModel}
          onSelect={setSelectedModel}
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
        className="mb-6 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 flex items-center justify-center"
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

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Chat with AI</h2>
        <div className="border rounded-lg overflow-hidden">
          <div className="h-96 overflow-y-auto p-4 bg-gray-50">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-4 ${
                  message.role === 'user' ? 'text-right' : 'text-left'
                }`}
              >
                <div
                  className={`inline-block max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-red-600 text-white'
                      : 'bg-white text-gray-900'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 bg-white border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
              />
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 