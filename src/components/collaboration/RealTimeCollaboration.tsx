'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { MessageCircle, Users, Edit3, Eye } from 'lucide-react'

interface Collaborator {
  id: string
  name: string
  email: string
  avatar?: string
  isOnline: boolean
  lastSeen: Date
  currentSection?: string
}

interface Comment {
  id: string
  content: string
  author: {
    id: string
    name: string
    email: string
  }
  timestamp: Date
  section?: string
  resolved: boolean
}

interface RealTimeCollaborationProps {
  contentId: string
  contentType: 'draft' | 'idea' | 'content'
  initialContent?: string
  onContentChange?: (content: string) => void
}

// Input validation utilities
const validateCommentContent = (content: string): boolean => {
  if (!content || typeof content !== 'string') return false
  if (content.trim().length === 0) return false
  if (content.length > 1000) return false
  return true
}

const sanitizeContent = (content: string): string => {
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
}

const getSectionAtPosition = (text: string, position: number): string => {
  const lines = text.substring(0, position).split('\n')
  if (lines.length <= 3) return 'introduction'
  if (lines.length <= 8) return 'body'
  return 'conclusion'
}

const formatTimestamp = (date: Date): string => {
  try {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return date.toLocaleDateString()
  } catch (err) {
    return 'Unknown time'
  }
}

export default function RealTimeCollaboration({
  contentId,
  contentType,
  initialContent = '',
  onContentChange
}: RealTimeCollaborationProps) {
  const { data: session } = useSession()
  const [content, setContent] = useState(initialContent)
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [activeSection, setActiveSection] = useState<string>('')
  const [showCollaborators, setShowCollaborators] = useState(true)
  const [showComments, setShowComments] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const contentRef = useRef<HTMLTextAreaElement>(null)
  const commentsRef = useRef<HTMLDivElement>(null)
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Load initial data and set up real-time updates
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Mock data for demonstration
        const mockCollaborators: Collaborator[] = [
          {
            id: '1',
            name: 'John Creative',
            email: 'john@example.com',
            isOnline: true,
            lastSeen: new Date(),
            currentSection: 'introduction'
          },
          {
            id: '2',
            name: 'Sarah Client',
            email: 'sarah@example.com',
            isOnline: true,
            lastSeen: new Date(),
            currentSection: 'conclusion'
          },
          {
            id: '3',
            name: 'Mike Manager',
            email: 'mike@example.com',
            isOnline: false,
            lastSeen: new Date(Date.now() - 300000)
          }
        ]

        const mockComments: Comment[] = [
          {
            id: '1',
            content: 'Great start! Consider adding more specific examples in the second paragraph.',
            author: {
              id: '2',
              name: 'Sarah Client',
              email: 'sarah@example.com'
            },
            timestamp: new Date(Date.now() - 600000),
            section: 'introduction',
            resolved: false
          },
          {
            id: '2',
            content: 'The tone is perfect for our target audience.',
            author: {
              id: '1',
              name: 'John Creative',
              email: 'john@example.com'
            },
            timestamp: new Date(Date.now() - 300000),
            section: 'body',
            resolved: true
          }
        ]

        setCollaborators(mockCollaborators)
        setComments(mockComments)
      } catch (err) {
        setError('Failed to load collaboration data')
        console.error('Error loading collaboration data:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialData()

    // Simulate real-time updates
    updateIntervalRef.current = setInterval(() => {
      setCollaborators(prev => prev.map(collab => ({
        ...collab,
        lastSeen: new Date()
      })))
    }, 30000)

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current)
        updateIntervalRef.current = null
      }
    }
  }, [])

  // Debounced content change handler
  const debouncedContentChange = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout
      return (newContent: string) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          onContentChange?.(newContent)
        }, 300)
      }
    })(),
    [onContentChange]
  )

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setContent(newContent)
    debouncedContentChange(newContent)
    
    const cursorPosition = e.target.selectionStart
    const section = getSectionAtPosition(newContent, cursorPosition)
    setActiveSection(section)
  }

  const addComment = async () => {
    if (!session?.user) {
      setError('You must be logged in to add comments')
      return
    }

    const sanitizedComment = sanitizeContent(newComment)
    
    if (!validateCommentContent(sanitizedComment)) {
      setError('Comment must be between 1 and 1000 characters')
      return
    }

    try {
      setError(null)
      
      const comment: Comment = {
        id: crypto.randomUUID(),
        content: sanitizedComment,
        author: {
          id: session.user.id || '',
          name: session.user.name || '',
          email: session.user.email || ''
        },
        timestamp: new Date(),
        section: activeSection,
        resolved: false
      }

      setComments(prev => [...prev, comment])
      setNewComment('')
    } catch (err) {
      setError('Failed to add comment')
      console.error('Error adding comment:', err)
    }
  }

  const resolveComment = (commentId: string) => {
    try {
      setComments(prev => prev.map(comment => 
        comment.id === commentId ? { ...comment, resolved: true } : comment
      ))
    } catch (err) {
      setError('Failed to resolve comment')
      console.error('Error resolving comment:', err)
    }
  }

  // Error display component
  if (error) {
    return (
      <div className="flex h-full bg-white rounded-lg shadow-sm border">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 mb-2">⚠️ Error</div>
            <div className="text-gray-600 mb-4">{error}</div>
            <button
              onClick={() => setError(null)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-full bg-white rounded-lg shadow-sm border">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <div className="text-gray-600">Loading collaboration data...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full bg-white rounded-lg shadow-sm border">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {contentType === 'draft' ? 'Content Draft' : 
               contentType === 'idea' ? 'Idea Development' : 'Content Review'}
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm ${
                  isEditing 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                aria-label={isEditing ? 'Switch to view mode' : 'Switch to edit mode'}
              >
                {isEditing ? <Eye size={14} /> : <Edit3 size={14} />}
                <span>{isEditing ? 'View' : 'Edit'}</span>
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowCollaborators(!showCollaborators)}
              className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm ${
                showCollaborators 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              aria-label={`${showCollaborators ? 'Hide' : 'Show'} collaborators panel`}
            >
              <Users size={14} />
              <span>{collaborators.filter(c => c.isOnline).length}</span>
            </button>
            <button
              onClick={() => setShowComments(!showComments)}
              className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm ${
                showComments 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              aria-label={`${showComments ? 'Hide' : 'Show'} comments panel`}
            >
              <MessageCircle size={14} />
              <span>{comments.filter(c => !c.resolved).length}</span>
            </button>
          </div>
        </div>

        {/* Content Editor */}
        <div className="flex-1 p-4">
          {isEditing ? (
            <textarea
              ref={contentRef}
              value={content}
              onChange={handleContentChange}
              placeholder="Start writing your content here..."
              className="w-full h-full p-4 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ minHeight: '400px' }}
              aria-label="Content editor"
            />
          ) : (
            <div className="w-full h-full p-4 border rounded-lg bg-gray-50 overflow-y-auto">
              <div className="prose max-w-none">
                {content || (
                  <p className="text-gray-500 italic">
                    No content available. Click "Edit" to start writing.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-80 border-l bg-gray-50">
        {/* Collaborators Panel */}
        {showCollaborators && (
          <div className="p-4 border-b">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Users size={16} className="mr-2" />
              Collaborators ({collaborators.filter(c => c.isOnline).length} online)
            </h4>
            <div className="space-y-2">
              {collaborators.map(collaborator => (
                <div key={collaborator.id} className="flex items-center space-x-2 p-2 rounded-md bg-white">
                  <div className="relative">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {collaborator.name.charAt(0)}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                      collaborator.isOnline ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {collaborator.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {collaborator.isOnline 
                        ? collaborator.currentSection 
                          ? `Editing ${collaborator.currentSection}` 
                          : 'Online'
                        : `Last seen ${formatTimestamp(collaborator.lastSeen)}`
                      }
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comments Panel */}
        {showComments && (
          <div className="flex-1 p-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <MessageCircle size={16} className="mr-2" />
              Comments ({comments.filter(c => !c.resolved).length} active)
            </h4>
            
            {/* Add Comment */}
            <div className="mb-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full p-2 border rounded-md text-sm resize-none"
                rows={3}
                aria-label="Add a comment"
                maxLength={1000}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">
                  {newComment.length}/1000 characters
                </span>
                <button
                  onClick={addComment}
                  disabled={!newComment.trim() || newComment.length > 1000}
                  className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Add comment"
                >
                  Add Comment
                </button>
              </div>
            </div>

            {/* Comments List */}
            <div ref={commentsRef} className="space-y-3 max-h-96 overflow-y-auto">
              {comments.map(comment => (
                <div
                  key={comment.id}
                  className={`p-3 rounded-md border ${
                    comment.resolved ? 'bg-gray-50 opacity-75' : 'bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                        {comment.author.name.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {comment.author.name}
                      </span>
                      {comment.section && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {comment.section}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(comment.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{comment.content}</p>
                  {!comment.resolved && (
                    <button
                      onClick={() => resolveComment(comment.id)}
                      className="text-xs text-green-600 hover:text-green-700"
                      aria-label={`Mark comment by ${comment.author.name} as resolved`}
                    >
                      Mark as resolved
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 