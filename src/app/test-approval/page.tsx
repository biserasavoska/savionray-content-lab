'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { isClient } from '@/lib/auth'
import { IDEA_STATUS, DRAFT_STATUS } from '@/lib/utils/enum-constants'

export default function TestApprovalPage() {
  const { data: session } = useSession()
  const [ideaId, setIdeaId] = useState('')
  const [draftId, setDraftId] = useState('')
  const [testResult, setTestResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testIdeaApproval = async () => {
    if (!ideaId.trim()) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/test-approval`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ideaId: ideaId.trim(),
          status: IDEA_STATUS.APPROVED,
        }),
      })

      const result = await response.json()
      setTestResult({
        success: response.ok,
        status: response.status,
        data: result
      })
    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      })
    } finally {
      setLoading(false)
    }
  }

  const testDraftApproval = async () => {
    if (!ideaId.trim() || !draftId.trim()) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/ideas/${ideaId.trim()}/drafts/${draftId.trim()}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: DRAFT_STATUS.APPROVED,
        }),
      })

      const result = await response.json()
      setTestResult({
        success: response.ok,
        status: response.status,
        data: result
      })
    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      })
    } finally {
      setLoading(false)
    }
  }

  const testContentDraftApproval = async () => {
    if (!draftId.trim()) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/content-drafts/${draftId.trim()}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: DRAFT_STATUS.APPROVED,
        }),
      })

      const result = await response.json()
      setTestResult({
        success: response.ok,
        status: response.status,
        data: result
      })
    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : String(error)
      })
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Test Approval Functionality</h1>
        <p>Please sign in to test the approval functionality.</p>
      </div>
    )
  }

  if (!isClient(session)) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Test Approval Functionality</h1>
        <p>This test is only available for CLIENT users.</p>
        <p>Current user role: {session.user.role}</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Approval Functionality</h1>
      
      <div className="space-y-6">
        <div className="bg-white shadow sm:rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Test Idea Approval</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Idea ID
              </label>
              <input
                type="text"
                value={ideaId}
                onChange={(e) => setIdeaId(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Enter idea ID to test"
              />
            </div>
            <button
              onClick={testIdeaApproval}
              disabled={loading || !ideaId.trim()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
            >
              {loading ? 'Testing...' : 'Test Idea Approval'}
            </button>
          </div>
        </div>

        <div className="bg-white shadow sm:rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Test Draft Approval (Idea-specific endpoint)</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Idea ID
              </label>
              <input
                type="text"
                value={ideaId}
                onChange={(e) => setIdeaId(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Enter idea ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Draft ID
              </label>
              <input
                type="text"
                value={draftId}
                onChange={(e) => setDraftId(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Enter draft ID"
              />
            </div>
            <button
              onClick={testDraftApproval}
              disabled={loading || !ideaId.trim() || !draftId.trim()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-300"
            >
              {loading ? 'Testing...' : 'Test Draft Approval (Idea-specific)'}
            </button>
          </div>
        </div>

        <div className="bg-white shadow sm:rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Test Content Draft Approval (Direct endpoint)</h2>
          <p className="text-sm text-gray-600 mb-4">
            This tests the updated content draft API that allows clients to approve drafts for their organization.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Draft ID
              </label>
              <input
                type="text"
                value={draftId}
                onChange={(e) => setDraftId(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Enter draft ID"
              />
            </div>
            <button
              onClick={testContentDraftApproval}
              disabled={loading || !draftId.trim()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300"
            >
              {loading ? 'Testing...' : 'Test Content Draft Approval (Direct)'}
            </button>
          </div>
        </div>

        {testResult && (
          <div className="bg-white shadow sm:rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Test Result</h2>
            <div className={`p-4 rounded-md ${testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 