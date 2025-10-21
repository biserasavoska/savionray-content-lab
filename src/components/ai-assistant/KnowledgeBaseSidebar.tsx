'use client'

import { useState, useEffect } from 'react'
import { 
  PlusIcon, 
  FolderIcon,
  DocumentIcon,
  TrashIcon,
  ArrowUpTrayIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import { knowledgeBaseService } from '@/lib/knowledge-base/knowledge-base-service'

interface KnowledgeBase {
  id: string
  name: string
  description: string | null
  isPublic: boolean
  createdAt: string
  documents: KnowledgeDocument[]
  _count: {
    documents: number
  }
}

interface KnowledgeDocument {
  id: string
  filename: string
  originalName: string
  status: 'UPLOADED' | 'PROCESSING' | 'PROCESSED' | 'FAILED'
  createdAt: string
  _count: {
    chunks: number
  }
}

interface KnowledgeBaseSidebarProps {
  selectedKnowledgeBase: string | null
  onSelectKnowledgeBase: (id: string | null) => void
}

export default function KnowledgeBaseSidebar({ 
  selectedKnowledgeBase, 
  onSelectKnowledgeBase 
}: KnowledgeBaseSidebarProps) {
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newKnowledgeBaseName, setNewKnowledgeBaseName] = useState('')
  const [newKnowledgeBaseDescription, setNewKnowledgeBaseDescription] = useState('')

  // Load knowledge bases on component mount
  useEffect(() => {
    loadKnowledgeBases()
  }, [])

  const loadKnowledgeBases = async () => {
    try {
      setIsLoading(true)
      const data = await knowledgeBaseService.getKnowledgeBases()
      setKnowledgeBases(data)
    } catch (error) {
      console.error('Error loading knowledge bases:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateKnowledgeBase = async () => {
    if (!newKnowledgeBaseName.trim()) return

    try {
      const newKnowledgeBase = await knowledgeBaseService.createKnowledgeBase(
        newKnowledgeBaseName,
        newKnowledgeBaseDescription || undefined
      )
      setKnowledgeBases(prev => [newKnowledgeBase, ...prev])
      setNewKnowledgeBaseName('')
      setNewKnowledgeBaseDescription('')
      setShowCreateForm(false)
    } catch (error) {
      console.error('Error creating knowledge base:', error)
    }
  }

  const handleDeleteKnowledgeBase = async (knowledgeBaseId: string) => {
    try {
      await knowledgeBaseService.deleteKnowledgeBase(knowledgeBaseId)
      setKnowledgeBases(prev => prev.filter(kb => kb.id !== knowledgeBaseId))
      if (selectedKnowledgeBase === knowledgeBaseId) {
        onSelectKnowledgeBase(null)
      }
    } catch (error) {
      console.error('Error deleting knowledge base:', error)
    }
  }

  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Knowledge Base</h2>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Create Knowledge Base Form */}
      {showCreateForm && (
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Knowledge base name"
              value={newKnowledgeBaseName}
              onChange={(e) => setNewKnowledgeBaseName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              placeholder="Description (optional)"
              value={newKnowledgeBaseDescription}
              onChange={(e) => setNewKnowledgeBaseDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex space-x-2">
              <button
                onClick={handleCreateKnowledgeBase}
                className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
              >
                Create
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="flex-1 bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Knowledge Bases List */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="text-center text-gray-500 text-sm py-4">
            Loading knowledge bases...
          </div>
        ) : knowledgeBases.length > 0 ? (
          <div className="space-y-2">
            {knowledgeBases.map((knowledgeBase) => (
              <div
                key={knowledgeBase.id}
                className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedKnowledgeBase === knowledgeBase.id
                    ? 'bg-blue-100 text-blue-900'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => onSelectKnowledgeBase(knowledgeBase.id)}
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <FolderIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {knowledgeBase.name}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {knowledgeBase._count.documents} documents
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteKnowledgeBase(knowledgeBase.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 text-sm py-8">
            <FolderIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No knowledge bases yet</p>
            <p className="text-xs mt-1">Create one to get started</p>
          </div>
        )}
      </div>

      {/* Upload Button */}
      {selectedKnowledgeBase && (
        <div className="p-4 border-t border-gray-200">
          <button className="w-full flex items-center justify-center space-x-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <ArrowUpTrayIcon className="h-5 w-5" />
            <span>Upload Documents</span>
          </button>
        </div>
      )}
    </div>
  )
}
