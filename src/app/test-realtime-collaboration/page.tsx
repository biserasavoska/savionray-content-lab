'use client'

import React, { useState } from 'react'
import RealTimeCollaboration from '@/components/collaboration/RealTimeCollaboration'

export default function TestRealtimeCollaborationPage() {
  const [selectedContentType, setSelectedContentType] = useState<'draft' | 'idea' | 'content'>('draft')
  const [contentId, setContentId] = useState('test-content-123')

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Real-Time Collaboration Test
          </h1>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">🚀 Phase 2 Features</h2>
            <ul className="text-blue-800 space-y-1 text-sm">
              <li>• <strong>Socket.IO Integration:</strong> Real-time content synchronization</li>
              <li>• <strong>Presence Tracking:</strong> See who's online and what they're editing</li>
              <li>• <strong>Live Comments:</strong> Real-time commenting with resolution</li>
              <li>• <strong>Connection Status:</strong> Visual indicators for connection health</li>
              <li>• <strong>Typing Indicators:</strong> See when others are typing</li>
              <li>• <strong>Room Management:</strong> Isolated collaboration spaces</li>
              <li>• <strong>Error Handling:</strong> Graceful connection failures</li>
            </ul>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">📋 Testing Instructions</h3>
            <ol className="text-yellow-800 space-y-2 text-sm">
              <li><strong>1. Start Socket.IO Server:</strong> Run <code className="bg-yellow-100 px-1 rounded">npm run socket-server</code> in terminal</li>
              <li><strong>2. Open Multiple Tabs:</strong> Open this page in 2-3 browser tabs</li>
              <li><strong>3. Sign In:</strong> Use test credentials (creative@savionray.com, client@savionray.com, etc.)</li>
              <li><strong>4. Test Features:</strong> Try editing content, adding comments, and watching real-time updates</li>
              <li><strong>5. Test Disconnection:</strong> Stop the socket server to see error handling</li>
            </ol>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content Type
              </label>
              <select
                value={selectedContentType}
                onChange={(e) => setSelectedContentType(e.target.value as 'draft' | 'idea' | 'content')}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="draft">Content Draft</option>
                <option value="idea">Idea Development</option>
                <option value="content">Content Review</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content ID
              </label>
              <input
                type="text"
                value={contentId}
                onChange={(e) => setContentId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter content ID"
              />
            </div>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Socket.IO Server</h4>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Should be running on port 4001</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Check terminal for "🚀 Socket.IO server running"
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Next.js App</h4>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Running on port 3000</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              This page should be accessible
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Database</h4>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Connected</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Test users should be available
            </p>
          </div>
        </div>

        {/* Real-Time Collaboration Component */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="h-[600px]">
            <RealTimeCollaboration
              contentId={contentId}
              contentType={selectedContentType}
              initialContent={`Welcome to the ${selectedContentType} collaboration test!

This is a shared workspace where multiple users can:
• Edit content in real-time
• Add and resolve comments
• See who's currently online
• Track what section others are editing

Try opening this page in multiple browser tabs with different user accounts to test the real-time features.

Current content type: ${selectedContentType}
Content ID: ${contentId}

Start collaborating! 🚀`}
              onContentChange={(content) => {
                console.log('Content changed:', content.substring(0, 100) + '...')
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Real-time collaboration powered by Socket.IO | 
            <a href="/test" className="text-blue-600 hover:text-blue-700 ml-2">
              Back to Test Hub
            </a>
          </p>
        </div>
      </div>
    </div>
  )
} 