'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDownIcon, CheckIcon, SparklesIcon } from '@heroicons/react/24/outline'

export interface ModelOption {
  id: string
  name: string
  description: string
  category: 'gpt5' | 'pro' | 'legacy' | 'reasoning'
  thinkingMode?: 'auto' | 'instant' | 'thinking-mini' | 'thinking'
  isPro?: boolean
}

const MODEL_OPTIONS: ModelOption[] = [
  // GPT-5 Thinking Modes
  {
    id: 'gpt-5-auto',
    name: 'Auto',
    description: 'Decides how long to think',
    category: 'gpt5',
    thinkingMode: 'auto'
  },
  {
    id: 'gpt-5-instant',
    name: 'Instant',
    description: 'Answers right away',
    category: 'gpt5',
    thinkingMode: 'instant'
  },
  {
    id: 'gpt-5-thinking-mini',
    name: 'Thinking mini',
    description: 'Thinks quickly',
    category: 'gpt5',
    thinkingMode: 'thinking-mini'
  },
  {
    id: 'gpt-5-thinking',
    name: 'Thinking',
    description: 'Thinks longer for better answers',
    category: 'gpt5',
    thinkingMode: 'thinking'
  },
  // Pro Model
  {
    id: 'gpt-5-pro',
    name: 'Pro',
    description: 'Research-grade intelligence',
    category: 'pro',
    isPro: true
  },
  // Legacy Models
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    description: 'Legacy model',
    category: 'legacy'
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    description: 'Legacy model',
    category: 'legacy'
  },
  {
    id: 'o3',
    name: 'o3',
    description: 'Legacy model - Advanced reasoning',
    category: 'reasoning'
  },
  {
    id: 'o4-mini',
    name: 'o4-mini',
    description: 'Legacy model - Fast reasoning',
    category: 'reasoning'
  }
]

// Map model IDs to actual OpenAI API model names and reasoning effort
export const getAPIModelId = (modelId: string): string => {
  const mapping: { [key: string]: string } = {
    // GPT-5 models - using actual GPT-5 API names
    'gpt-5-auto': 'gpt-5-chat-latest',
    'gpt-5-instant': 'gpt-5-nano',
    'gpt-5-thinking-mini': 'gpt-5-mini',
    'gpt-5-thinking': 'gpt-5',
    'gpt-5-pro': 'gpt-5-pro',
    // Legacy models
    'gpt-4o': 'gpt-4o',
    'gpt-4': 'gpt-4',
    // Reasoning models (o-series use Responses API)
    'o3': 'o3',
    'o4-mini': 'o4-mini'
  }
  return mapping[modelId] || 'gpt-5-mini'
}

// Get reasoning effort level based on model selection
export const getReasoningEffort = (modelId: string): 'low' | 'medium' | 'high' | undefined => {
  const effortMap: { [key: string]: 'low' | 'medium' | 'high' | undefined } = {
    'gpt-5-auto': 'medium',        // Auto decides but defaults to medium
    'gpt-5-instant': 'low',        // Fast, minimal reasoning
    'gpt-5-thinking-mini': 'medium', // Quick thinking
    'gpt-5-thinking': 'high',      // Deep thinking
    'gpt-5-pro': 'high',           // Research-grade
    'o3': 'high',                  // Advanced reasoning
    'o4-mini': 'medium'            // Fast reasoning
  }
  return effortMap[modelId]
}

// Check if model requires Responses API (for reasoning models)
export const requiresResponsesAPI = (modelId: string): boolean => {
  return modelId === 'o3' || modelId === 'o4-mini'
}

interface ModelSelectorProps {
  selectedModel: string
  onModelChange: (modelId: string) => void
}

export default function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showLegacyModels, setShowLegacyModels] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedOption = MODEL_OPTIONS.find(m => m.id === selectedModel) || MODEL_OPTIONS[0]

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setShowLegacyModels(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleModelSelect = (modelId: string) => {
    onModelChange(modelId)
    setIsOpen(false)
    setShowLegacyModels(false)
  }

  const gpt5Models = MODEL_OPTIONS.filter(m => m.category === 'gpt5')
  const proModels = MODEL_OPTIONS.filter(m => m.category === 'pro')
  const legacyModels = MODEL_OPTIONS.filter(m => m.category === 'legacy')
  const reasoningModels = MODEL_OPTIONS.filter(m => m.category === 'reasoning')

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm hover:border-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span className="font-medium text-gray-900">ChatGPT 5</span>
        <ChevronDownIcon className="w-4 h-4 text-gray-600" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900">Select Model</span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {/* GPT-5 Section */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="text-xs font-medium text-gray-500 mb-2">GPT-5</div>
              <div className="space-y-1">
                {gpt5Models.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => handleModelSelect(model.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors ${
                      selectedModel === model.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium text-gray-900">{model.name}</div>
                      <div className="text-xs text-gray-500">{model.description}</div>
                    </div>
                    {selectedModel === model.id && (
                      <CheckIcon className="w-4 h-4 text-blue-600 flex-shrink-0 ml-2" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Pro Section */}
            <div className="px-4 py-3 border-b border-gray-100">
              {proModels.map((model) => (
                <button
                  key={model.id}
                  onClick={() => handleModelSelect(model.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors ${
                    selectedModel === model.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex-1 flex items-center space-x-2">
                    <SparklesIcon className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    <div className="text-left flex-1">
                      <div className="text-sm font-medium text-gray-900">{model.name}</div>
                      <div className="text-xs text-gray-500">{model.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {selectedModel === model.id && (
                      <CheckIcon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    )}
                    <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded">
                      Upgrade
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Legacy Models Section */}
            <div className="px-4 py-3">
              <button
                onClick={() => setShowLegacyModels(!showLegacyModels)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">Legacy models</span>
                <ChevronDownIcon
                  className={`w-4 h-4 text-gray-600 transition-transform ${
                    showLegacyModels ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {showLegacyModels && (
                <div className="mt-2 space-y-1">
                  {[...legacyModels, ...reasoningModels].map((model) => (
                    <button
                      key={model.id}
                      onClick={() => handleModelSelect(model.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors ${
                        selectedModel === model.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium text-gray-900">{model.name}</div>
                        <div className="text-xs text-gray-500">{model.description}</div>
                      </div>
                      {selectedModel === model.id && (
                        <CheckIcon className="w-4 h-4 text-blue-600 flex-shrink-0 ml-2" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

