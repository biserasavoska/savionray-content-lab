'use client'

import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import Button from '@/components/ui/common/Button'
import StatusBadge from '@/components/ui/common/StatusBadge'

export default function TestGPT5Page() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [selectedModel, setSelectedModel] = useState('gpt-5-mini')
  const [verbosity, setVerbosity] = useState('medium')
  const [reasoningEffort, setReasoningEffort] = useState('medium')

  if (!session) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
        <p>You need to be signed in to test GPT-5 integration.</p>
      </div>
    )
  }

  const testBasicGeneration = async () => {
    setIsLoading(true)
    setResults(null)

    try {
      const response = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'GPT-5 Test',
          description: 'Testing GPT-5 integration',
          format: 'linkedin',
          model: selectedModel,
          verbosity: verbosity,
          reasoningEffort: reasoningEffort
        })
      })

      const data = await response.json()
      setResults({
        success: response.ok,
        status: response.status,
        data: data,
        model: selectedModel
      })
    } catch (error) {
      setResults({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testModelInfo = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/test-gpt5', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testType: 'model-availability'
        })
      })

      const data = await response.json()
      setResults({
        success: response.ok,
        data: data
      })
    } catch (error) {
      setResults({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">GPT-5 Integration Test</h1>
      
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-bold mb-4">Configuration</h2>
        
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Model</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="gpt-5">GPT-5 (Full)</option>
              <option value="gpt-5-mini">GPT-5 Mini</option>
              <option value="gpt-5-nano">GPT-5 Nano</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Verbosity</label>
            <select
              value={verbosity}
              onChange={(e) => setVerbosity(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Reasoning Effort</label>
            <select
              value={reasoningEffort}
              onChange={(e) => setReasoningEffort(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="minimal">Minimal</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div className="space-x-4">
          <button
            onClick={testBasicGeneration}
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Test Content Generation'}
          </button>

          <button
            onClick={testModelInfo}
            disabled={isLoading}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Check Models Available'}
          </button>
        </div>
      </div>

      {results && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Results</h2>
          
          <div className="mb-4">
            <span className={`px-3 py-1 rounded text-sm font-medium ${
              results.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {results.success ? 'Success' : 'Failed'}
            </span>
            {results.status && <span className="ml-2 text-gray-600">Status: {results.status}</span>}
            {results.model && <span className="ml-2 text-gray-600">Model: {results.model}</span>}
          </div>

          {results.data && results.data.postText && (
            <div className="mb-4">
              <h3 className="font-medium mb-2">Generated Content:</h3>
              <div className="bg-blue-50 p-4 rounded">
                <p className="mb-2">{results.data.postText}</p>
                {results.data.hashtags && (
                  <div className="mb-2">
                    {results.data.hashtags.map((tag: string, i: number) => (
                      <span key={i} className="inline-block bg-blue-200 text-blue-800 px-2 py-1 rounded text-sm mr-1">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                {results.data.callToAction && (
                  <p className="italic text-gray-700">{results.data.callToAction}</p>
                )}
              </div>
            </div>
          )}

          {results.data && results.data.models && (
            <div className="mb-4">
              <h3 className="font-medium mb-2">Available GPT-5 Models:</h3>
              <div className="space-y-2">
                {results.data.models.map((model: any, i: number) => (
                  <div key={i} className="bg-gray-50 p-3 rounded">
                    <div className="font-medium">{model.name}</div>
                    <div className="text-sm text-gray-600">{model.description}</div>
                    <div className="text-xs text-gray-500">
                      Input: ${model.cost.input}/1M | Output: ${model.cost.output}/1M
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.error && (
            <div className="bg-red-50 p-4 rounded">
              <h3 className="font-medium text-red-900 mb-2">Error:</h3>
              <p className="text-red-700">{results.error}</p>
            </div>
          )}

          <details className="mt-4">
            <summary className="cursor-pointer font-medium">Raw Response</summary>
            <pre className="bg-gray-900 text-green-400 p-4 rounded mt-2 overflow-auto text-sm">
              {JSON.stringify(results.data, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  )
}
