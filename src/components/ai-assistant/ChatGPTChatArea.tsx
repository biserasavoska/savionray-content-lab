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
import { chatService } from '@/lib/chat/chat-service'
import ModelSelector, { getAPIModelId, getReasoningEffort } from './ModelSelector'

interface ChatGPTChatAreaProps {
  conversationId: string | null
  knowledgeBaseId?: string | null
}

interface Message {
  id: string
  role: 'USER' | 'ASSISTANT' | 'SYSTEM'
  content: string
  createdAt: string
  isStreaming?: boolean
}

export default function ChatGPTChatArea({ conversationId, knowledgeBaseId }: ChatGPTChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [selectedModel, setSelectedModel] = useState('gpt-5-auto')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Load messages when conversation changes
  useEffect(() => {
    if (conversationId) {
      loadMessages()
    } else {
      setMessages([])
    }
  }, [conversationId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadMessages = async () => {
    if (!conversationId) return
    
    try {
      setIsLoading(true)
      const conversationMessages = await chatService.getMessages(conversationId)
      setMessages(conversationMessages)
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const messageContent = inputValue.trim()
    setInputValue('')
    setIsStreaming(true)

    try {
      // Create user message
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'USER',
        content: messageContent,
        createdAt: new Date().toISOString()
      }

      setMessages(prev => [...prev, userMessage])

      // Save user message to database
      if (conversationId) {
        await chatService.sendMessage(conversationId, messageContent, 'USER')
      }

      // Create AI response message placeholder
      const aiMessageId = (Date.now() + 1).toString()
      const aiMessage: Message = {
        id: aiMessageId,
        role: 'ASSISTANT',
        content: '',
        createdAt: new Date().toISOString(),
        isStreaming: true
      }

      setMessages(prev => [...prev, aiMessage])

      // Get API model ID and reasoning effort
      const apiModelId = getAPIModelId(selectedModel)
      const reasoningEffort = getReasoningEffort(selectedModel)

      // Stream AI response with model configuration
      const stream = await chatService.streamResponse(
        messageContent, 
        conversationId || undefined, 
        apiModelId,
        reasoningEffort
      )
      let fullResponse = ''

      await chatService.parseStreamResponse(
        stream,
        (chunk: string) => {
          fullResponse += chunk
          setMessages(prev => 
            prev.map(msg => 
              msg.id === aiMessageId 
                ? { ...msg, content: fullResponse }
                : msg
            )
          )
        },
        () => {
          setIsStreaming(false)
          setMessages(prev => 
            prev.map(msg => 
              msg.id === aiMessageId 
                ? { ...msg, isStreaming: false }
                : msg
            )
          )
        }
      )

    } catch (error) {
      console.error('Error sending message:', error)
      setIsStreaming(false)
      setMessages(prev => prev.filter(msg => msg.id !== (Date.now() + 1).toString()))
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value)
    
    // Auto-resize
    const textarea = e.target
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px'
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      {/* Top Header */}
      <div className="border-b border-gray-200 p-4 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">SR</span>
              </div>
              <span className="font-semibold text-gray-900">Savion Ray AI</span>
            </div>
            <ModelSelector 
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
            />
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
              <div key={message.id} className={`flex items-start space-x-4 py-4 ${message.role === 'USER' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'USER' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                    : 'bg-gradient-to-r from-green-400 to-blue-500'
                }`}>
                  <span className="text-white font-bold text-sm">
                    {message.role === 'USER' ? 'U' : 'AI'}
                  </span>
                </div>
                <div className={`flex-1 max-w-3xl ${message.role === 'USER' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block p-4 rounded-2xl shadow-sm ${
                    message.role === 'USER'
                      ? 'bg-blue-600 text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-900 rounded-bl-md'
                  }`}>
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {message.content}
                      {message.isStreaming && (
                        <span className="inline-block w-2 h-5 bg-gray-500 animate-pulse ml-1 align-middle"></span>
                      )}
                    </div>
                  </div>
                  <div className={`text-xs text-gray-500 mt-2 ${message.role === 'USER' ? 'text-right' : 'text-left'}`}>
                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Message Savion Ray AI..."
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
