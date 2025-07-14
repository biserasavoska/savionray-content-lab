'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'

import { isCreative, isClient, isAdmin } from '@/lib/auth'
import Button from '@/components/ui/common/Button'
import Badge from '@/components/ui/common/Badge'

interface Comment {
  id: string
  content: string
  author: {
    id: string
    name: string
    email: string
    role: string
  }
  createdAt: Date
  updatedAt: Date
  parentId?: string
  replies: Comment[]
  mentions: string[]
  isResolved: boolean
}

interface Feedback {
  id: string
  type: 'general' | 'specific' | 'approval' | 'rejection'
  content: string
  author: {
    id: string
    name: string
    email: string
    role: string
  }
  createdAt: Date
  status: 'pending' | 'addressed' | 'resolved'
  priority: 'low' | 'medium' | 'high' | 'critical'
  targetSection?: string
}

interface Version {
  id: string
  version: string
  changes: string
  author: {
    id: string
    name: string
    email: string
  }
  createdAt: Date
  isCurrent: boolean
}

interface ContentCollaborationPanelProps {
  contentId: string
  contentType: string
  onCommentAdd: (comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>) => void
  onFeedbackAdd: (feedback: Omit<Feedback, 'id' | 'createdAt'>) => void
  onVersionCreate: (version: Omit<Version, 'id' | 'createdAt'>) => void
}

export default function ContentCollaborationPanel({
  contentId,
  contentType,
  onCommentAdd,
  onFeedbackAdd,
  onVersionCreate,
}: ContentCollaborationPanelProps) {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<'comments' | 'feedback' | 'versions' | 'activity'>('comments')
  const [comments, setComments] = useState<Comment[]>([])
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [versions, setVersions] = useState<Version[]>([])
  const [newComment, setNewComment] = useState('')
  const [newFeedback, setNewFeedback] = useState('')
  const [feedbackType, setFeedbackType] = useState<Feedback['type']>('general')
  const [feedbackPriority, setFeedbackPriority] = useState<Feedback['priority']>('medium')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const commentsEndRef = useRef<HTMLDivElement>(null)

  // Mock data for demonstration
  useEffect(() => {
    setComments([
      {
        id: '1',
        content: 'This section needs more detail about the target audience.',
        author: {
          id: 'user1',
          name: 'John Client',
          email: 'john@client.com',
          role: 'client'
        },
        createdAt: new Date('2025-07-07T10:00:00Z'),
        updatedAt: new Date('2025-07-07T10:00:00Z'),
        replies: [],
        mentions: [],
        isResolved: false
      },
      {
        id: '2',
        content: 'I\'ve added more context about the audience demographics. @john@client.com can you review?',
        author: {
          id: 'user2',
          name: 'Sarah Creative',
          email: 'sarah@creative.com',
          role: 'creative'
        },
        createdAt: new Date('2025-07-07T11:30:00Z'),
        updatedAt: new Date('2025-07-07T11:30:00Z'),
        replies: [],
        mentions: ['john@client.com'],
        isResolved: true
      }
    ])

    setFeedback([
      {
        id: '1',
        type: 'specific',
        content: 'The headline needs to be more compelling and action-oriented.',
        author: {
          id: 'user1',
          name: 'John Client',
          email: 'john@client.com',
          role: 'client'
        },
        createdAt: new Date('2025-07-07T09:00:00Z'),
        status: 'pending',
        priority: 'high'
      }
    ])

    setVersions([
      {
        id: '1',
        version: 'v1.0',
        changes: 'Initial draft created',
        author: {
          id: 'user2',
          name: 'Sarah Creative',
          email: 'sarah@creative.com'
        },
        createdAt: new Date('2025-07-07T08:00:00Z'),
        isCurrent: false
      },
      {
        id: '2',
        version: 'v1.1',
        changes: 'Added audience context and improved headline',
        author: {
          id: 'user2',
          name: 'Sarah Creative',
          email: 'sarah@creative.com'
        },
        createdAt: new Date('2025-07-07T12:00:00Z'),
        isCurrent: true
      }
    ])
  }, [])

  const handleAddComment = async () => {
    if (!newComment.trim() || !session?.user) return

    setIsLoading(true)
    try {
      const comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'> = {
        content: newComment,
        author: {
          id: session.user.id,
          name: session.user.name || '',
          email: session.user.email || '',
          role: session.user.role || 'client'
        },
        replies: [],
        mentions: extractMentions(newComment),
        isResolved: false
      }

      await onCommentAdd(comment)
      setNewComment('')
      setReplyTo(null)
    } catch (error) {
      console.error('Failed to add comment:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddFeedback = async () => {
    if (!newFeedback.trim() || !session?.user) return

    setIsLoading(true)
    try {
      const feedbackItem: Omit<Feedback, 'id' | 'createdAt'> = {
        type: feedbackType,
        content: newFeedback,
        author: {
          id: session.user.id,
          name: session.user.name || '',
          email: session.user.email || '',
          role: session.user.role || 'client'
        },
        status: 'pending',
        priority: feedbackPriority
      }

      await onFeedbackAdd(feedbackItem)
      setNewFeedback('')
      setFeedbackType('general')
      setFeedbackPriority('medium')
    } catch (error) {
      console.error('Failed to add feedback:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const extractMentions = (text: string): string[] => {
    const mentionRegex = /@([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g
    const mentions: string[] = []
    let match
    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[1])
    }
    return mentions
  }

  const getPriorityColor = (priority: Feedback['priority']) => {
    switch (priority) {
      case 'low': return 'default'
      case 'medium': return 'warning'
      case 'high': return 'error'
      case 'critical': return 'error'
      default: return 'default'
    }
  }

  const getFeedbackTypeColor = (type: Feedback['type']) => {
    switch (type) {
      case 'general': return 'default'
      case 'specific': return 'primary'
      case 'approval': return 'success'
      case 'rejection': return 'error'
      default: return 'default'
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  if (!session) {
    return <div className="p-4 text-center text-gray-500">Please sign in to collaborate</div>
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'comments', label: 'Comments', count: comments.length },
            { id: 'feedback', label: 'Feedback', count: feedback.length },
            { id: 'versions', label: 'Versions', count: versions.length },
            { id: 'activity', label: 'Activity', count: 0 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <Badge variant="default" size="sm" className="ml-2">
                  {tab.count}
                </Badge>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {/* Comments Tab */}
        {activeTab === 'comments' && (
          <div className="space-y-6">
            <div className="space-y-4">
              {comments.map(comment => (
                <div key={comment.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {comment.author.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {comment.author.name}
                        </span>
                        <Badge variant="default" size="sm">
                          {comment.author.role}
                        </Badge>
                        {comment.isResolved && (
                          <Badge variant="success" size="sm">
                            Resolved
                          </Badge>
                        )}
                        <span className="text-xs text-gray-500">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">{comment.content}</p>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                        >
                          Reply
                        </Button>
                        {comment.mentions.length > 0 && (
                          <div className="text-xs text-gray-500">
                            Mentions: {comment.mentions.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Comment */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Add Comment</h4>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Type your comment... Use @email to mention team members"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
              <div className="mt-3 flex space-x-2">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleAddComment}
                  disabled={isLoading || !newComment.trim()}
                >
                  {isLoading ? 'Adding...' : 'Add Comment'}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setNewComment('')}
                  disabled={isLoading}
                >
                  Clear
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Tab */}
        {activeTab === 'feedback' && (
          <div className="space-y-6">
            <div className="space-y-4">
              {feedback.map(item => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Badge variant={getFeedbackTypeColor(item.type)} size="sm">
                        {item.type.replace('_', ' ')}
                      </Badge>
                      <Badge variant={getPriorityColor(item.priority)} size="sm">
                        {item.priority}
                      </Badge>
                      <Badge 
                        variant={item.status === 'resolved' ? 'success' : 'warning'} 
                        size="sm"
                      >
                        {item.status}
                      </Badge>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-green-600">
                        {item.author.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        {item.author.name}
                      </div>
                      <p className="text-sm text-gray-700">{item.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Feedback */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Add Feedback</h4>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      value={feedbackType}
                      onChange={(e) => setFeedbackType(e.target.value as Feedback['type'])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="general">General</option>
                      <option value="specific">Specific</option>
                      <option value="approval">Approval</option>
                      <option value="rejection">Rejection</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      value={feedbackPriority}
                      onChange={(e) => setFeedbackPriority(e.target.value as Feedback['priority'])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
                <textarea
                  value={newFeedback}
                  onChange={(e) => setNewFeedback(e.target.value)}
                  placeholder="Describe your feedback..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={handleAddFeedback}
                    disabled={isLoading || !newFeedback.trim()}
                  >
                    {isLoading ? 'Adding...' : 'Add Feedback'}
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setNewFeedback('')}
                    disabled={isLoading}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Versions Tab */}
        {activeTab === 'versions' && (
          <div className="space-y-4">
            {versions.map(version => (
              <div key={version.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">{version.version}</span>
                    {version.isCurrent && (
                      <Badge variant="success" size="sm">Current</Badge>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDate(version.createdAt)}
                  </span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-purple-600">
                      {version.author.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 mb-1">
                      {version.author.name}
                    </div>
                    <p className="text-sm text-gray-700">{version.changes}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="text-center text-gray-500 py-8">
            <p>Activity feed will show recent collaboration events</p>
          </div>
        )}
      </div>
    </div>
  )
} 