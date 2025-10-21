'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  BookOpenIcon,
  FaceSmileIcon,
  Squares2X2Icon,
  FolderPlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { chatService } from '@/lib/chat/chat-service'

interface Conversation {
  id: string
  title: string | null
  model: string
  createdAt: string
  updatedAt: string
  messages: any[]
  _count: {
    messages: number
  }
}

interface ChatGPTSidebarProps {
  selectedConversation: string | null
  onSelectConversation: (id: string) => void
  onToggleKnowledgeBase?: () => void
}

export default function ChatGPTSidebar({ 
  selectedConversation, 
  onSelectConversation,
  onToggleKnowledgeBase 
}: ChatGPTSidebarProps) {
  const { data: session } = useSession()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Load conversations on component mount
  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = async () => {
    try {
      setIsLoading(true)
      const data = await chatService.getConversations()
      setConversations(data)
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewChat = async () => {
    try {
      const newConversation = await chatService.createConversation('New Chat')
      setConversations(prev => [newConversation, ...prev])
      onSelectConversation(newConversation.id)
    } catch (error) {
      console.error('Error creating new chat:', error)
    }
  }

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await chatService.deleteConversation(conversationId)
      setConversations(prev => prev.filter(conv => conv.id !== conversationId))
      if (selectedConversation === conversationId) {
        onSelectConversation('')
      }
    } catch (error) {
      console.error('Error deleting conversation:', error)
    }
  }

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(conv =>
    conv.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.messages[0]?.content?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className={`bg-gray-50 border-r border-gray-200 flex flex-col h-full transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-80'
    }`}>
      {/* Header with Logo */}
      <div className="p-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">SR</span>
            </div>
            <span className="font-semibold text-gray-900">Savion Ray AI</span>
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* New Chat Button */}
        <button 
          onClick={handleNewChat}
          className="w-full flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <PlusIcon className="h-5 w-5 text-gray-600" />
          {!isCollapsed && <span className="text-gray-900">New chat</span>}
        </button>

        {/* Search Chats */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={isCollapsed ? "" : "Search chats"}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm ${
              isCollapsed ? 'hidden' : ''
            }`}
          />
        </div>

        {/* Conversations List */}
        <div className="space-y-2">
          {isLoading ? (
            <div className="text-center text-gray-500 text-sm py-4">
              Loading conversations...
            </div>
          ) : filteredConversations.length > 0 ? (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedConversation === conversation.id
                    ? 'bg-blue-100 text-blue-900'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => onSelectConversation(conversation.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {conversation.title || 'New Chat'}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {conversation.messages[0]?.content || 'No messages yet'}
                  </div>
                </div>
                {!isCollapsed && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteConversation(conversation.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 text-sm py-4">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </div>
          )}
        </div>

        {/* Library */}
        <div className="space-y-2">
          <div 
            className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 cursor-pointer"
            onClick={() => onToggleKnowledgeBase?.()}
          >
            <BookOpenIcon className="h-5 w-5" />
            {!isCollapsed && <span className="text-sm">Knowledge Base</span>}
          </div>
        </div>

        {/* Codex */}
        <div className="space-y-2">
          <div className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 cursor-pointer">
            <FaceSmileIcon className="h-5 w-5" />
            {!isCollapsed && <span className="text-sm">Codex</span>}
          </div>
        </div>

        {/* GPTs Section */}
        <div className="space-y-3">
          <h3 className={`font-semibold text-gray-900 ${isCollapsed ? 'hidden' : ''}`}>GPTs</h3>
          
          {/* Explore GPTs */}
          <div className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 cursor-pointer">
            <Squares2X2Icon className="h-5 w-5" />
            {!isCollapsed && <span className="text-sm">Explore</span>}
          </div>
        </div>

        {/* Projects Section */}
        <div className="space-y-3">
          <h3 className={`font-semibold text-gray-900 ${isCollapsed ? 'hidden' : ''}`}>Projects</h3>
          
          <div className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 cursor-pointer">
            <FolderPlusIcon className="h-5 w-5" />
            {!isCollapsed && <span className="text-sm">New project</span>}
          </div>
        </div>
      </div>

      {/* User Profile Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {session?.user?.name?.charAt(0) || 'U'}
            </span>
          </div>
          {!isCollapsed && (
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">
                {session?.user?.name || 'User'}
              </div>
              <div className="text-xs text-gray-500">Plus</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
