'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  PaperClipIcon, 
  MicrophoneIcon, 
  SpeakerWaveIcon,
  ChevronDownIcon,
  ArrowUpIcon,
  PlusIcon
} from '@heroicons/react/24/outline'

interface ChatGPTChatAreaProps {
  conversationId: string | null
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function ChatGPTChatArea({ conversationId }: ChatGPTChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [selectedModel, setSelectedModel] = useState('ChatGPT 5 Thinking')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsStreaming(true)

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'This is a simulated AI response. In the actual implementation, this will be replaced with streaming responses from OpenAI.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMessage])
      setIsStreaming(false)
    }, 2000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      {/* Top Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 text-gray-900 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors">
              <span className="font-medium">{selectedModel}</span>
              <ChevronDownIcon className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <span className="text-sm">Skip to content</span>
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <span className="text-sm">A</span>
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <span className="text-sm">☐</span>
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <h1 className="text-2xl font-medium text-gray-900 mb-4">
              What are you working on?
            </h1>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map(message => (
              <div key={message.id} className={`flex items-start space-x-4 ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                    : 'bg-gradient-to-r from-green-400 to-blue-500'
                }`}>
                  <span className="text-white font-bold text-sm">
                    {message.role === 'user' ? 'U' : 'AI'}
                  </span>
                </div>
                <div className={`flex-1 max-w-2xl ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block p-4 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  </div>
                </div>
              </div>
            ))}
            {isStreaming && (
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AI</span>
                </div>
                <div className="flex-1 max-w-2xl">
                  <div className="inline-block p-4 rounded-lg bg-gray-100 text-gray-900">
                    <div className="flex items-center space-x-2">
                      <div className="animate-pulse">Thinking...</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask anything"
              className="w-full p-4 pr-16 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={1}
              style={{ minHeight: '56px', maxHeight: '200px' }}
            />
            
            <div className="absolute right-2 bottom-2 flex items-center space-x-2">
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <PlusIcon className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <PaperClipIcon className="h-5 w-5" />
              </button>
              <button 
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isStreaming}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowUpIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 hover:text-gray-900 transition-colors">
                <PlusIcon className="h-4 w-4" />
                <span>Extended thinking</span>
                <ChevronDownIcon className="h-3 w-3" />
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors">
                <MicrophoneIcon className="h-4 w-4" />
              </button>
              <button className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors">
                <SpeakerWaveIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
