'use client'

import React, { useState } from 'react'
import { useSession } from 'next-auth/react'

export default function GPT5EnhancedEditor() {
  const { data: session } = useSession()
  const [content, setContent] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedModel, setSelectedModel] = useState('gpt-5-mini')
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
          title: 'GPT-5 Test Content',
          description: content || 'Generate test content using GPT-5',
          format: 'linkedin',
          model: selectedModel,
          verbosity: 'medium',
          reasoningEffort: 'medium',
          maxOutputTokens: 1000
        })
      })

      const data = await response.json()
      
      if (data.success && data.postText) {
        setResults(data)
        setContent(data.postText)
      } else {
        setResults({ error: data.error || 'Generation failed' })
      }
      
    } catch (error) {
      console.error('Content generation failed:', error)
      setResults({ error: 'Network error occurred' })
    } finally {
      setIsGenerating(false)
    }
  }

  if (!session) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
        <p>You need to be signed in to test GPT-5.</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">GPT-5 Enhanced Editor Test</h1>
      
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-bold mb-4">Configuration</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Model</label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2"
          >
            <option value="gpt-5">GPT-5</option>
            <option value="gpt-5-mini">GPT-5 Mini</option>
            <option value="gpt-5-nano">GPT-5 Nano</option>
          </select>
        </div>
        
        <button
          onClick={generateContent}
          disabled={isGenerating}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isGenerating ? 'Generating...' : 'Test Content Generation'}
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-bold mb-4">Content</h2>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter content description or leave empty for test generation..."
          className="w-full h-32 border border-gray-300 rounded px-3 py-2 mb-4"
        />
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