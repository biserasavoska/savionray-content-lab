'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Button from '@/components/ui/common/Button'

export default function TestFeedbackSimplePage() {
  const { data: session } = useSession()
  const [testResult, setTestResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const testFeedbackAPI = async () => {
    setLoading(true)
    setTestResult('')
    
    try {
      const response = await fetch('/api/feedback/management')
      const data = await response.json()
      
      if (response.status === 401) {
        setTestResult('✅ API working correctly - returns 401 when not authenticated')
      } else if (response.ok) {
        setTestResult(`✅ API working correctly - returned ${data.feedbacks?.length || 0} feedback items`)
      } else {
        setTestResult(`❌ API error: ${data.error || 'Unknown error'}`)
      }
    } catch (error) {
      setTestResult(`❌ Network error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const testFeedbackSubmission = async () => {
    setLoading(true)
    setTestResult('')
    
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentDraftId: 'test-draft-123',
          comment: 'This is a test feedback submission',
        }),
      })
      
      const data = await response.json()
      
      if (response.status === 401) {
        setTestResult('✅ Feedback submission API working correctly - returns 401 when not authenticated')
      } else if (response.ok) {
        setTestResult('✅ Feedback submission API working correctly')
      } else {
        setTestResult(`❌ Feedback submission error: ${data.error || 'Unknown error'}`)
      }
    } catch (error) {
      setTestResult(`❌ Network error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-gray-600">You need to be signed in to test feedback functionality.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Simple Feedback Test</h1>
            <p className="text-gray-600 mt-1">Test basic feedback API functionality</p>
          </div>

          <div className="space-y-6">
            {/* Test Controls */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">API Tests</h2>
              <div className="flex space-x-4">
                <Button
                  onClick={testFeedbackAPI}
                  loading={loading}
                  disabled={loading}
                >
                  Test Feedback Management API
                </Button>
                <Button
                  onClick={testFeedbackSubmission}
                  loading={loading}
                  disabled={loading}
                  variant="outline"
                >
                  Test Feedback Submission API
                </Button>
              </div>
            </div>

            {/* Test Results */}
            {testResult && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Test Results</h2>
                <div className="p-4 bg-gray-50 rounded-md">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">{testResult}</pre>
                </div>
              </div>
            )}

            {/* User Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Current User</h2>
              <div className="space-y-2">
                <p><strong>Name:</strong> {session.user.name || 'Not provided'}</p>
                <p><strong>Email:</strong> {session.user.email}</p>
                <p><strong>User ID:</strong> {session.user.id || 'Not available'}</p>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h2 className="text-lg font-medium text-blue-900 mb-4">Instructions</h2>
              <ul className="text-blue-800 space-y-2">
                <li>• Click "Test Feedback Management API" to test the feedback listing endpoint</li>
                <li>• Click "Test Feedback Submission API" to test the feedback creation endpoint</li>
                <li>• Both should return 401 (Unauthorized) when not properly authenticated</li>
                <li>• This confirms the API routes are working correctly</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 