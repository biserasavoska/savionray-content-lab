'use client'

import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import { 
  FileText, 
  Users, 
  MessageCircle, 
  CheckCircle, 
  ArrowRight,
  Zap,
  Palette,
  Table,
  Image as ImageIcon,
  Link as LinkIcon,
  Bold,
  Italic,
  Underline,
  List,
  Quote,
  Heading1,
  Heading2
} from 'lucide-react'
import RealTimeCollaboration from '@/components/collaboration/RealTimeCollaboration'
import CollaborationWorkflow from '@/components/workflow/CollaborationWorkflow'
import RichTextEditor from '@/components/editor/RichTextEditor'

export default function TestPhase5Page() {
  const { data: session } = useSession()
  const [selectedFeature, setSelectedFeature] = useState<'rich-text' | 'workflow' | 'collaboration'>('collaboration')
  const [contentId] = useState('phase5-test-' + Date.now())
  const [workflowType, setWorkflowType] = useState<'development' | 'review' | 'approval'>('development')
  const [contentType, setContentType] = useState<'idea' | 'draft' | 'content'>('draft')
  const [richTextContent, setRichTextContent] = useState('<h1>Welcome to Phase 5!</h1><p>This is a <strong>rich text editor</strong> with <em>real-time collaboration</em> features.</p><ul><li>Rich formatting</li><li>Real-time sync</li><li>Workflow integration</li></ul>')

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600">Please sign in to test Phase 5 features.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🚀 Phase 5: Rich Text & Workflow Integration</h1>
              <p className="text-sm text-gray-600">Advanced collaboration with rich text editor and workflow management</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Logged in as: <span className="font-medium">{session.user?.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setSelectedFeature('rich-text')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedFeature === 'rich-text'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Palette size={16} />
                <span>Rich Text Editor</span>
              </div>
            </button>
            <button
              onClick={() => setSelectedFeature('workflow')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedFeature === 'workflow'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <CheckCircle size={16} />
                <span>Workflow Integration</span>
              </div>
            </button>
            <button
              onClick={() => setSelectedFeature('collaboration')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedFeature === 'collaboration'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Users size={16} />
                <span>Real-time Collaboration</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Feature Overview */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">🎯 Phase 5 Features Overview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Rich Text Editor */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Palette size={20} className="text-blue-500" />
                  <h3 className="font-medium text-gray-900">Rich Text Editor</h3>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Professional WYSIWYG editor</li>
                  <li>• Real-time formatting sync</li>
                  <li>• Images, links, and tables</li>
                  <li>• Text alignment and colors</li>
                  <li>• Bubble and floating menus</li>
                </ul>
              </div>

              {/* Workflow Integration */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <CheckCircle size={20} className="text-green-500" />
                  <h3 className="font-medium text-gray-900">Workflow Integration</h3>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Multi-step workflows</li>
                  <li>• Status tracking</li>
                  <li>• Notifications system</li>
                  <li>• Quick actions</li>
                  <li>• Workflow history</li>
                </ul>
              </div>

              {/* Enhanced Collaboration */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Users size={20} className="text-purple-500" />
                  <h3 className="font-medium text-gray-900">Enhanced Collaboration</h3>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Rich text real-time sync</li>
                  <li>• Collaborative cursor positions</li>
                  <li>• Enhanced conflict resolution</li>
                  <li>• Workflow-aware collaboration</li>
                  <li>• Integrated notifications</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Selector */}
        {selectedFeature === 'rich-text' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">📝 Rich Text Editor Testing</h2>
              <p className="text-gray-600 mb-4">
                Test the new rich text editor with advanced formatting capabilities, real-time collaboration, and workflow integration.
              </p>
              
              <div className="mb-4">
                <h3 className="font-medium text-gray-900 mb-2">Editor Features:</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div className="flex items-center space-x-1">
                    <Bold size={14} />
                    <span>Bold, Italic, Underline</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Heading1 size={14} />
                    <span>Headings (H1, H2, H3)</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <List size={14} />
                    <span>Bullet & Numbered Lists</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Quote size={14} />
                    <span>Blockquotes</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <LinkIcon size={14} />
                    <span>Links & Images</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Table size={14} />
                    <span>Tables</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Palette size={14} />
                    <span>Text Colors</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Zap size={14} />
                    <span>Real-time Sync</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border">
              <RichTextEditor
                content={richTextContent}
                onContentChange={setRichTextContent}
                placeholder="Start writing with rich formatting..."
                isCollaborating={true}
              />
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-medium text-gray-900 mb-2">HTML Output:</h3>
              <pre className="bg-gray-50 p-4 rounded text-xs overflow-x-auto">
                {richTextContent}
              </pre>
            </div>
          </div>
        )}

        {selectedFeature === 'workflow' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">⚡ Workflow Integration Testing</h2>
              <p className="text-gray-600 mb-4">
                Test the workflow integration that connects real-time collaboration with existing app features.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Workflow Type
                  </label>
                  <select
                    value={workflowType}
                    onChange={(e) => setWorkflowType(e.target.value as any)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="development">Development Workflow</option>
                    <option value="review">Review Workflow</option>
                    <option value="approval">Approval Workflow</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content Type
                  </label>
                  <select
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value as any)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="idea">Idea</option>
                    <option value="draft">Draft</option>
                    <option value="content">Content</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content ID
                  </label>
                  <input
                    type="text"
                    value={contentId}
                    readOnly
                    className="w-full p-2 border rounded-md bg-gray-50"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border" style={{ height: '600px' }}>
              <CollaborationWorkflow
                contentId={contentId}
                contentType={contentType}
                workflowType={workflowType}
                onWorkflowUpdate={(workflow) => {
                  console.log('Workflow updated:', workflow)
                }}
              />
            </div>
          </div>
        )}

        {selectedFeature === 'collaboration' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">👥 Enhanced Real-time Collaboration Testing</h2>
              <p className="text-gray-600 mb-4">
                Test the enhanced real-time collaboration with rich text editor integration and workflow awareness.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content Type
                  </label>
                  <select
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value as any)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="idea">Idea</option>
                    <option value="draft">Draft</option>
                    <option value="content">Content</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Test Content
                  </label>
                  <select
                    onChange={(e) => {
                      const content = e.target.value
                      if (content === 'rich') {
                        setRichTextContent('<h1>Rich Text Collaboration</h1><p>This is a <strong>test</strong> of rich text collaboration with <em>formatting</em>.</p><ul><li>Real-time sync</li><li>Rich formatting</li><li>Comments</li></ul>')
                      } else if (content === 'workflow') {
                        setRichTextContent('<h1>Workflow Integration Test</h1><p>Testing workflow integration with real-time collaboration.</p><h2>Current Step</h2><p>Development Phase</p><h2>Next Steps</h2><ol><li>Review</li><li>Approval</li><li>Publishing</li></ol>')
                      }
                    }}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select test content...</option>
                    <option value="rich">Rich Text Example</option>
                    <option value="workflow">Workflow Example</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border" style={{ height: '600px' }}>
              <RealTimeCollaboration
                contentId={contentId}
                contentType={contentType}
                initialContent={richTextContent}
                onContentChange={(content) => {
                  setRichTextContent(content)
                  console.log('Content updated:', content.substring(0, 100) + '...')
                }}
              />
            </div>
          </div>
        )}

        {/* Testing Instructions */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">🧪 Testing Instructions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Rich Text Editor</h3>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>Try all formatting options</li>
                <li>Insert images and links</li>
                <li>Create tables</li>
                <li>Test bubble and floating menus</li>
                <li>Verify real-time collaboration</li>
              </ol>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Workflow Integration</h3>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>Switch between workflow types</li>
                <li>Complete workflow steps</li>
                <li>Check notifications</li>
                <li>Test quick actions</li>
                <li>Verify workflow history</li>
              </ol>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Real-time Collaboration</h3>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>Open multiple browser tabs</li>
                <li>Test rich text sync</li>
                <li>Add comments</li>
                <li>Check presence indicators</li>
                <li>Test conflict resolution</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">🚀 Next Steps</h2>
          <div className="flex items-center space-x-2 text-blue-800">
            <ArrowRight size={20} />
            <span className="font-medium">Ready to test? Open multiple browser tabs to test real-time collaboration!</span>
          </div>
          <p className="text-blue-700 mt-2">
            Phase 5 successfully integrates rich text editing with workflow management and enhanced real-time collaboration.
          </p>
        </div>
      </div>
    </div>
  )
} 