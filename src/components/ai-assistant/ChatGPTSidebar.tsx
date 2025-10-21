'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  BookOpenIcon,
  FaceSmileIcon,
  Squares2X2Icon,
  FolderPlusIcon
} from '@heroicons/react/24/outline'

interface ChatGPTSidebarProps {
  selectedConversation: string | null
  onSelectConversation: (id: string) => void
}

export default function ChatGPTSidebar({ 
  selectedConversation, 
  onSelectConversation 
}: ChatGPTSidebarProps) {
  const { data: session } = useSession()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleNewChat = () => {
    // TODO: Implement new chat creation
    console.log('New chat clicked')
  }

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
            className={`w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm ${
              isCollapsed ? 'hidden' : ''
            }`}
          />
        </div>

        {/* Library */}
        <div className="space-y-2">
          <div className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 cursor-pointer">
            <BookOpenIcon className="h-5 w-5" />
            {!isCollapsed && <span className="text-sm">Library</span>}
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
