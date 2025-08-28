'use client'

import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import Button from '@/components/ui/common/Button'

export default function TestCleanPage() {
  const { data: session } = useSession()
  const [content, setContent] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [results, setResults] = useState<any>(null)

  const generateContent = async () => {
    if (!session?.user) return

    setIsGenerating(true)
    setResults(null)
    
    try {
      const response = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Test Content',
          description: content || 'Generate test content',
          format: 'linkedin',
          model: 'gpt-5-mini',
          verbosity: 'medium',
          reasoningEffort: 'medium',
          maxOutputTokens: 1000
        })
      })

      const data = await response.json()
      setResults(data)
      
    } catch (error) {
      console.error('Generation failed:', error)
      setResults({ error: 'Failed to generate content' })
    } finally {
      setIsGenerating(false)
    }
  }

  if (!session) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
        <p>You need to be signed in to test content generation.</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Clean GPT-5 Test</h1>
      
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-bold mb-4">Content Generation Test</h2>
        
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter content description..."
          className="w-full h-32 border border-gray-300 rounded px-3 py-2 mb-4"
        />
        
        <Button
          onClick={generateContent}
          disabled={isGenerating}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isGenerating ? 'Generating...' : 'Generate Content'}
        </Button>
      </div>

      {results && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Results</h2>
          {results.error ? (
            <div className="text-red-600">Error: {results.error}</div>
          ) : (
            <div>
              <h3 className="font-bold mb-2">Generated Content:</h3>
              <p className="mb-4">{results.postText}</p>
              {results.hashtags && (
                <div>
                  <h4 className="font-bold mb-2">Hashtags:</h4>
                  <p>{results.hashtags.join(', ')}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
