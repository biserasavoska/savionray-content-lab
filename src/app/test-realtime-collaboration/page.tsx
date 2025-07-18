'use client'

import React from 'react'
import RealTimeCollaboration from '@/components/collaboration/RealTimeCollaboration'

export default function TestRealTimeCollaborationPage() {
  const handleContentChange = (content: string) => {
    console.log('Content changed:', content)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Real-Time Collaboration - Phase 1 Test
          </h1>
          <p className="text-gray-600">
            Testing the security, stability, and error handling improvements
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Scenarios</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">✅ Security Fixes</h3>
              <ul className="text-blue-700 space-y-1">
                <li>• Secure random IDs (crypto.randomUUID)</li>
                <li>• Input validation & sanitization</li>
                <li>• XSS prevention</li>
                <li>• Comment length limits</li>
              </ul>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-900 mb-2">✅ Stability Fixes</h3>
              <ul className="text-green-700 space-y-1">
                <li>• Memory leak prevention</li>
                <li>• Proper cleanup in useEffect</li>
                <li>• Debounced content changes</li>
                <li>• Error boundaries</li>
              </ul>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-medium text-purple-900 mb-2">✅ Error Handling</h3>
              <ul className="text-purple-700 space-y-1">
                <li>• Try-catch blocks</li>
                <li>• Loading states</li>
                <li>• Error display</li>
                <li>• Graceful degradation</li>
              </ul>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <h3 className="font-medium text-orange-900 mb-2">✅ Accessibility</h3>
              <ul className="text-orange-700 space-y-1">
                <li>• ARIA labels</li>
                <li>• Keyboard navigation</li>
                <li>• Screen reader support</li>
                <li>• Character counters</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="h-96">
          <RealTimeCollaboration
            contentId="test-content-123"
            contentType="draft"
            initialContent="This is a test content for the real-time collaboration component. You can edit this content and test the various features including comments, collaborator tracking, and error handling."
            onContentChange={handleContentChange}
          />
        </div>

        <div className="mt-6 bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Testing Instructions</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div>
              <strong>1. Security Testing:</strong>
              <ul className="ml-4 mt-1 space-y-1">
                <li>• Try adding comments with HTML/script tags - they should be sanitized</li>
                <li>• Try adding very long comments - should be limited to 1000 characters</li>
                <li>• Check browser console - comment IDs should be UUIDs, not timestamps</li>
              </ul>
            </div>
            <div>
              <strong>2. Error Handling Testing:</strong>
              <ul className="ml-4 mt-1 space-y-1">
                <li>• Try adding comments without being logged in</li>
                <li>• Check that loading states appear briefly</li>
                <li>• Verify error messages are displayed properly</li>
              </ul>
            </div>
            <div>
              <strong>3. Performance Testing:</strong>
              <ul className="ml-4 mt-1 space-y-1">
                <li>• Type quickly in the content editor - should be debounced</li>
                <li>• Check browser dev tools - no memory leaks in console</li>
                <li>• Verify smooth interactions without lag</li>
              </ul>
            </div>
            <div>
              <strong>4. Accessibility Testing:</strong>
              <ul className="ml-4 mt-1 space-y-1">
                <li>• Navigate with keyboard only (Tab, Enter, Space)</li>
                <li>• Check that ARIA labels are present in dev tools</li>
                <li>• Verify character counter works properly</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 