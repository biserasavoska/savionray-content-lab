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
            Real-Time Collaboration Test - Phase 3
          </h1>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-green-900 mb-2">🚀 Phase 3 Features (Latest)</h2>
            <ul className="text-green-800 space-y-1 text-sm">
              <li>• <strong>Database Persistence:</strong> Content and comments saved to PostgreSQL</li>
              <li>• <strong>Conflict Resolution:</strong> Operational transformation for simultaneous edits</li>
              <li>• <strong>Offline Support:</strong> Change queuing when disconnected</li>
              <li>• <strong>Advanced OT:</strong> Simple operational transformation algorithm</li>
              <li>• <strong>Conflict UI:</strong> Visual conflict resolution modal</li>
              <li>• <strong>Retry Logic:</strong> Automatic retry with exponential backoff</li>
              <li>• <strong>Queue Management:</strong> Offline operation queuing</li>
            </ul>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">✅ Phase 2 Features (Previous)</h2>
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
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">📋 Phase 3 Testing Instructions</h3>
            <ol className="text-yellow-800 space-y-2 text-sm">
              <li><strong>1. Start Socket.IO Server:</strong> Run <code className="bg-yellow-100 px-1 rounded">npm run socket-server</code> in terminal</li>
              <li><strong>2. Open Multiple Tabs:</strong> Open this page in 2-3 browser tabs</li>
              <li><strong>3. Sign In:</strong> Use test credentials (creative@savionray.com, client@savionray.com, etc.)</li>
              <li><strong>4. Test Database Persistence:</strong> Edit content and refresh - it should persist</li>
              <li><strong>5. Test Conflict Resolution:</strong> Edit same content simultaneously in different tabs</li>
              <li><strong>6. Test Offline Support:</strong> Disconnect internet and make changes, then reconnect</li>
              <li><strong>7. Test Comment Persistence:</strong> Add comments and refresh - they should remain</li>
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
                <option value="draft">Content Draft (Database)</option>
                <option value="idea">Idea Development (Database)</option>
                <option value="content">Content Review (Memory)</option>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Socket.IO Server</h4>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Running on port 4001</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Database persistence enabled
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Next.js App</h4>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Running on port 3000</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Offline support enabled
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Database</h4>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Connected</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Content persistence active
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Conflict Resolution</h4>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Operational Transform</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Real-time conflict handling
            </p>
          </div>
        </div>

        {/* Feature Testing Guide */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🧪 Feature Testing Guide</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Database Persistence Test</h4>
              <ol className="text-sm text-gray-600 space-y-1">
                <li>1. Edit content in the collaboration area</li>
                <li>2. Add some comments</li>
                <li>3. Refresh the browser page</li>
                <li>4. Verify content and comments are still there</li>
                <li>5. Check browser console for database logs</li>
              </ol>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Conflict Resolution Test</h4>
              <ol className="text-sm text-gray-600 space-y-1">
                <li>1. Open this page in two browser tabs</li>
                <li>2. Sign in with different accounts</li>
                <li>3. Edit the same content simultaneously</li>
                <li>4. Watch for conflict resolution modal</li>
                <li>5. Choose how to resolve the conflict</li>
              </ol>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Offline Support Test</h4>
              <ol className="text-sm text-gray-600 space-y-1">
                <li>1. Disconnect your internet connection</li>
                <li>2. Make changes to content and comments</li>
                <li>3. Notice the offline indicator</li>
                <li>4. Reconnect to the internet</li>
                <li>5. Watch queued changes sync automatically</li>
              </ol>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Performance Test</h4>
              <ol className="text-sm text-gray-600 space-y-1">
                <li>1. Type quickly in the content editor</li>
                <li>2. Check for debounced updates (300ms delay)</li>
                <li>3. Monitor browser performance</li>
                <li>4. Test with large content (&gt;10KB)</li>
                <li>5. Verify smooth real-time sync</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Real-Time Collaboration Component */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="h-[600px]">
            <RealTimeCollaboration
              contentId={contentId}
              contentType={selectedContentType}
              initialContent={`Welcome to the ${selectedContentType} collaboration test - Phase 3!

This is a shared workspace with advanced real-time features:

🔹 DATABASE PERSISTENCE
• Content and comments are saved to PostgreSQL
• Changes persist across browser refreshes
• Automatic loading from database on connection

🔹 CONFLICT RESOLUTION
• Operational transformation for simultaneous edits
• Visual conflict resolution modal
• Choose between local, remote, or merged content

🔹 OFFLINE SUPPORT
• Changes are queued when offline
• Automatic sync when connection is restored
• Retry logic with exponential backoff

🔹 ADVANCED FEATURES
• Real-time presence tracking
• Typing indicators
• Connection status monitoring
• Room-based collaboration

Current content type: ${selectedContentType}
Content ID: ${contentId}
Database persistence: ${selectedContentType !== 'content' ? 'Enabled' : 'Disabled (memory only)'}

Try the testing scenarios above to see all features in action! 🚀`}
              onContentChange={(content) => {
                console.log('Content changed:', content.substring(0, 100) + '...')
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Real-time collaboration powered by Socket.IO + Operational Transformation | 
            <a href="/test" className="text-blue-600 hover:text-blue-700 ml-2">
              Back to Test Hub
            </a>
          </p>
          <p className="mt-2 text-xs">
            Phase 3: Database Persistence • Conflict Resolution • Offline Support
          </p>
        </div>
      </div>
    </div>
  )
} 