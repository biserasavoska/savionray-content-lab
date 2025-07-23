'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { MessageCircle, Users, Edit3, Eye, Wifi, WifiOff, AlertCircle, GitBranch } from 'lucide-react'
// SOCKET.IO CLIENT
import { io, Socket } from 'socket.io-client'
// RICH TEXT EDITOR
import RichTextEditor from '@/components/editor/RichTextEditor'

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

interface ContentOperation {
  id: string
  type: 'insert' | 'delete'
  position: number
  text?: string
  length?: number
  timestamp: number
  userId: string
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

// Simple Operational Transformation for conflict resolution
class SimpleOT {
  private operations: ContentOperation[] = []
  private baseContent: string = ''

  constructor(initialContent: string) {
    this.baseContent = initialContent
  }

  applyOperation(operation: ContentOperation): string {
    let content = this.baseContent
    
    // Sort operations by timestamp
    const sortedOps = [...this.operations, operation].sort((a, b) => a.timestamp - b.timestamp)
    
    for (const op of sortedOps) {
      if (op.type === 'insert' && op.text) {
        content = content.slice(0, op.position) + op.text + content.slice(op.position)
        // Adjust positions of subsequent operations
        this.adjustPositions(op.position, op.text.length)
      } else if (op.type === 'delete' && op.length) {
        content = content.slice(0, op.position) + content.slice(op.position + op.length)
        // Adjust positions of subsequent operations
        this.adjustPositions(op.position, -op.length)
      }
    }
    
    this.operations.push(operation)
    this.baseContent = content
    return content
  }

  private adjustPositions(fromPosition: number, offset: number) {
    for (const op of this.operations) {
      if (op.position > fromPosition) {
        op.position += offset
      }
    }
  }

  getOperations(): ContentOperation[] {
    return [...this.operations]
  }

  reset(initialContent: string) {
    this.baseContent = initialContent
    this.operations = []
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
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting')
  const [isTyping, setIsTyping] = useState(false)
  const [pendingOperations, setPendingOperations] = useState<ContentOperation[]>([])
  const [conflictResolution, setConflictResolution] = useState<{
    show: boolean
    localContent: string
    remoteContent: string
    onResolve: (content: string) => void
  }>({ show: false, localContent: '', remoteContent: '', onResolve: () => {} })
  
  const contentRef = useRef<HTMLTextAreaElement>(null)
  const commentsRef = useRef<HTMLDivElement>(null)
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const socketRef = useRef<Socket | null>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const otRef = useRef<SimpleOT>(new SimpleOT(initialContent))
  const lastCursorPositionRef = useRef<number>(0)

  // --- SOCKET.IO CONNECTION WITH AUTHENTICATION ---
  useEffect(() => {
    console.log('🔍 RealTimeCollaboration useEffect triggered:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      sessionData: session
    })

    if (!session?.user) {
      console.log('❌ No session or user data available')
      setError('Authentication required')
      return
    }

    // Debug session data
    console.log('🔍 Session data for Socket.IO:', {
      userId: session.user.id,
      userName: session.user.name,
      userEmail: session.user.email,
      fullSession: session
    })

    // Connect to Socket.IO server with authentication
    console.log('🔌 Attempting Socket.IO connection with auth:', {
      userId: session.user.id || session.user.email,
      userName: session.user.name || 'Anonymous',
      userEmail: session.user.email || ''
    })

    const socket = io('http://localhost:4001', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: {
        userId: session.user.id || session.user.email,
        userName: session.user.name || 'Anonymous',
        userEmail: session.user.email || ''
      }
    })
    socketRef.current = socket

    // Connection status handlers
    socket.on('connect', () => {
      console.log('Connected to Socket.IO server')
      setConnectionStatus('connected')
      setError(null)
      
      // Join the room for this content
      socket.emit('join-room', { contentId, contentType })
    })

    socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server')
      setConnectionStatus('disconnected')
    })

    socket.on('connect_error', (error) => {
      console.error('❌ Socket.IO connection error:', error)
      console.error('❌ Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      })
      setConnectionStatus('error')
      setError(`Connection failed: ${error.message}`)
    })

    // Room state handlers
    socket.on('room-state', (state: any) => {
      if (state) {
        setContent(state.content || initialContent)
        setComments(state.comments || [])
        setCollaborators(state.users || [])
        otRef.current.reset(state.content || initialContent)
      }
    })

    // Content change handlers with conflict resolution
    socket.on('content-change', (data: { content: string, updatedBy: string, timestamp: Date, operations?: ContentOperation[] }) => {
      if (data.updatedBy !== session.user.id) {
        // Apply remote operations
        if (data.operations) {
          let newContent = content
          for (const operation of data.operations) {
            newContent = otRef.current.applyOperation(operation)
          }
          setContent(newContent)
          onContentChange?.(newContent)
        } else {
          // Fallback to simple content replacement
          setContent(data.content)
          onContentChange?.(data.content)
        }
      }
    })

    // Conflict resolution handler
    socket.on('content-conflict', (data: { localContent: string, remoteContent: string, operations: ContentOperation[] }) => {
      setConflictResolution({
        show: true,
        localContent: data.localContent,
        remoteContent: data.remoteContent,
        onResolve: (resolvedContent: string) => {
          setContent(resolvedContent)
          onContentChange?.(resolvedContent)
          otRef.current.reset(resolvedContent)
          setConflictResolution({ show: false, localContent: '', remoteContent: '', onResolve: () => {} })
          
          // Send resolved content to server
          if (socketRef.current && connectionStatus === 'connected') {
            socketRef.current.emit('content-resolved', { content: resolvedContent })
          }
        }
      })
    })

    // Comment handlers
    socket.on('new-comment', (comment: Comment) => {
      setComments(prev => [...prev, comment])
      // Scroll to new comment
      setTimeout(() => {
        if (commentsRef.current) {
          commentsRef.current.scrollTop = commentsRef.current.scrollHeight
        }
      }, 100)
    })

    socket.on('comment-resolved', (data: { commentId: string }) => {
      setComments(prev => prev.map(comment => 
        comment.id === data.commentId ? { ...comment, resolved: true } : comment
      ))
    })

    // Presence handlers
    socket.on('user-joined', (user: Collaborator) => {
      setCollaborators(prev => {
        const existing = prev.find(c => c.id === user.id)
        if (existing) {
          return prev.map(c => c.id === user.id ? { ...c, ...user } : c)
        }
        return [...prev, user]
      })
    })

    socket.on('user-left', (user: { id: string, name: string, lastSeen: Date }) => {
      setCollaborators(prev => prev.map(c => 
        c.id === user.id ? { ...c, isOnline: false, lastSeen: user.lastSeen } : c
      ))
    })

    socket.on('user-activity', (data: { userId: string, userName: string, section: string, activity: string }) => {
      setCollaborators(prev => prev.map(c => 
        c.id === data.userId ? { ...c, currentSection: data.section } : c
      ))
    })

    // Error handler
    socket.on('error', (data: { message: string }) => {
      setError(data.message)
    })

    // Clean up on unmount
    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [session, contentId, contentType, initialContent, onContentChange])

  // --- END SOCKET.IO CONNECTION ---

  // Generate operations from content changes
  const generateOperations = (oldContent: string, newContent: string, cursorPosition: number): ContentOperation[] => {
    const operations: ContentOperation[] = []
    
    // Simple diff algorithm - in production, use a more sophisticated diff library
    if (newContent.length > oldContent.length) {
      // Insertion
      const insertedText = newContent.slice(cursorPosition, cursorPosition + (newContent.length - oldContent.length))
      operations.push({
        id: crypto.randomUUID(),
        type: 'insert',
        position: cursorPosition,
        text: insertedText,
        timestamp: Date.now(),
        userId: session?.user?.id || ''
      })
    } else if (newContent.length < oldContent.length) {
      // Deletion
      const deletedLength = oldContent.length - newContent.length
      operations.push({
        id: crypto.randomUUID(),
        type: 'delete',
        position: cursorPosition,
        length: deletedLength,
        timestamp: Date.now(),
        userId: session?.user?.id || ''
      })
    }
    
    return operations
  }

  // Debounced content change handler with operational transformation
  const debouncedContentChange = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout
      return (newContent: string, cursorPosition: number) => {
        clearTimeout(timeoutId)
        
        // Show typing indicator
        if (socketRef.current && connectionStatus === 'connected') {
          setIsTyping(true)
          socketRef.current.emit('user-activity', { 
            section: getSectionAtPosition(newContent, cursorPosition),
            activity: 'typing'
          })
          
          // Clear typing indicator after delay
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
          typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 2000)
        }
        
        timeoutId = setTimeout(() => {
          // Generate operations for conflict resolution
          const operations = generateOperations(content, newContent, cursorPosition)
          
          // Apply operations locally
          let transformedContent = newContent
          for (const operation of operations) {
            transformedContent = otRef.current.applyOperation(operation)
          }
          
          // Emit operations to server
          if (socketRef.current && connectionStatus === 'connected') {
            socketRef.current.emit('content-change', { 
              content: transformedContent,
              operations,
              section: getSectionAtPosition(transformedContent, cursorPosition)
            })
          }
          onContentChange?.(transformedContent)
        }, 300)
      }
    })(),
    [onContentChange, connectionStatus, content]
  )

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    debouncedContentChange(newContent, lastCursorPositionRef.current)
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

      // Emit new comment to server
      if (socketRef.current && connectionStatus === 'connected') {
        socketRef.current.emit('new-comment', comment)
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
      if (socketRef.current && connectionStatus === 'connected') {
        socketRef.current.emit('resolve-comment', { commentId })
      }
    setComments(prev => prev.map(comment => 
      comment.id === commentId ? { ...comment, resolved: true } : comment
    ))
    } catch (err) {
      setError('Failed to resolve comment')
      console.error('Error resolving comment:', err)
    }
  }

  // Connection status indicator
  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Wifi size={16} className="text-green-500" />
      case 'connecting':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
      case 'disconnected':
        return <WifiOff size={16} className="text-gray-400" />
      case 'error':
        return <AlertCircle size={16} className="text-red-500" />
      default:
        return <WifiOff size={16} className="text-gray-400" />
    }
  }

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected'
      case 'connecting':
        return 'Connecting...'
      case 'disconnected':
        return 'Disconnected'
      case 'error':
        return 'Connection Error'
      default:
        return 'Unknown'
    }
  }

  // Conflict resolution modal
  if (conflictResolution.show) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🔄 Content Conflict Detected
          </h3>
          <p className="text-gray-600 mb-4">
            There's a conflict between your local changes and remote changes. Please resolve the conflict:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Your Version</h4>
              <textarea
                value={conflictResolution.localContent}
                readOnly
                className="w-full h-32 p-2 border rounded-md text-sm bg-gray-50"
              />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Remote Version</h4>
              <textarea
                value={conflictResolution.remoteContent}
                readOnly
                className="w-full h-32 p-2 border rounded-md text-sm bg-gray-50"
              />
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => conflictResolution.onResolve(conflictResolution.localContent)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Use My Version
            </button>
            <button
              onClick={() => conflictResolution.onResolve(conflictResolution.remoteContent)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Use Remote Version
            </button>
            <button
              onClick={() => conflictResolution.onResolve(conflictResolution.localContent + '\n\n---\n\n' + conflictResolution.remoteContent)}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Merge Both
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Error display component
  if (error && connectionStatus === 'error') {
    return (
      <div className="flex h-full bg-white rounded-lg shadow-sm border">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 mb-2">⚠️ Connection Error</div>
            <div className="text-gray-600 mb-4">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Reconnect
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
            {/* Connection Status */}
            <div className="flex items-center space-x-1 px-2 py-1 rounded-md text-xs bg-gray-100">
              {getConnectionStatusIcon()}
              <span className="text-gray-600">{getConnectionStatusText()}</span>
            </div>
            
            {/* Conflict Resolution Indicator */}
            {pendingOperations.length > 0 && (
              <div className="flex items-center space-x-1 px-2 py-1 rounded-md text-xs bg-yellow-100">
                <GitBranch size={14} className="text-yellow-600" />
                <span className="text-yellow-700">Resolving conflicts...</span>
              </div>
            )}
            
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
            <div className="relative">
              <RichTextEditor
                content={content}
                onContentChange={handleContentChange}
              placeholder="Start writing your content here..."
                disabled={connectionStatus !== 'connected'}
                isCollaborating={connectionStatus === 'connected'}
                onCursorChange={(position) => {
                  lastCursorPositionRef.current = position
                  const section = getSectionAtPosition(content, position)
                  setActiveSection(section)
                }}
              />
              {isTyping && (
                <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white px-2 py-1 rounded z-10">
                  Someone is typing...
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-full p-4 border rounded-lg bg-gray-50 overflow-y-auto">
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
              {!content && (
                  <p className="text-gray-500 italic">
                    No content available. Click "Edit" to start writing.
                  </p>
                )}
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
              {collaborators.length === 0 && (
                <p className="text-sm text-gray-500 italic">No collaborators yet</p>
              )}
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
                disabled={connectionStatus !== 'connected'}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">
                  {newComment.length}/1000 characters
                </span>
              <button
                onClick={addComment}
                  disabled={!newComment.trim() || newComment.length > 1000 || connectionStatus !== 'connected'}
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
                      disabled={connectionStatus !== 'connected'}
                    >
                      Mark as resolved
                    </button>
                  )}
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-sm text-gray-500 italic">No comments yet</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 