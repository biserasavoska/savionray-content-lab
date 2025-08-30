'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'
import Link from 'next/link'
import { 
  EyeIcon, 
  DocumentTextIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  ChatBubbleLeftIcon,
  LightBulbIcon,
  CalendarIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  PlusIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'

import { useInterface } from '@/hooks/useInterface'
import { useCurrentOrganization } from '@/hooks/useCurrentOrganization'
import Button from '@/components/ui/common/Button'
import Badge from '@/components/ui/common/Badge'

export default function TestPhase2Page() {
  const { data: session } = useSession()
  const interfaceContext = useInterface()
  const { organization, isLoading: orgLoading } = useCurrentOrganization()
  const [testResults, setTestResults] = useState<any>({})
  const [isTesting, setIsTesting] = useState(false)

  const runTests = async () => {
    setIsTesting(true)
    const results: any = {}

    try {
      // Test 1: Client Stats API
      console.log('Testing Client Stats API...')
      const statsRes = await fetch('/api/client/stats')
      results.clientStats = {
        success: statsRes.ok,
        status: statsRes.status,
        data: statsRes.ok ? await statsRes.json() : null
      }

      // Test 2: Ready Content API
      console.log('Testing Ready Content API...')
      const readyRes = await fetch('/api/ready-content?limit=5')
      results.readyContent = {
        success: readyRes.ok,
        status: readyRes.status,
        data: readyRes.ok ? await statsRes.json() : null
      }

      // Test 3: Approved Content API
      console.log('Testing Approved Content API...')
      const approvedRes = await fetch('/api/approved?limit=5')
      results.approvedContent = {
        success: approvedRes.ok,
        status: approvedRes.status,
        data: approvedRes.ok ? await approvedRes.json() : null
      }

    } catch (error) {
      console.error('Test error:', error)
      results.error = error
    } finally {
      setIsTesting(false)
      setTestResults(results)
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h2>
          <p className="text-gray-600">You need to be signed in to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Phase 2: Enhanced Client View Test
          </h1>
          <p className="text-gray-600 mb-6">
            Testing the enhanced client dashboard and role-based interfaces for Phase 2.
          </p>

          {/* User Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Current User Context</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500">User Email:</span>
                <p className="text-sm text-gray-900">{session.user?.email}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">User Role:</span>
                <Badge variant={interfaceContext.isClient ? 'default' : interfaceContext.isCreative ? 'default' : 'secondary'}>
                  {interfaceContext.userRole}
                </Badge>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Organization:</span>
                <p className="text-sm text-gray-900">{organization?.name || 'Loading...'}</p>
              </div>
            </div>

            {/* Role Permissions */}
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Role Permissions:</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant={interfaceContext.canCreateContent ? 'default' : 'secondary'}>
                  Create Content: {interfaceContext.canCreateContent ? 'Yes' : 'No'}
                </Badge>
                <Badge variant={interfaceContext.canApproveContent ? 'default' : 'secondary'}>
                  Approve Content: {interfaceContext.canApproveContent ? 'Yes' : 'No'}
                </Badge>
                <Badge variant={interfaceContext.canManageTeam ? 'default' : 'secondary'}>
                  Manage Team: {interfaceContext.canManageTeam ? 'Yes' : 'No'}
                </Badge>
                <Badge variant={interfaceContext.canViewAnalytics ? 'default' : 'secondary'}>
                  View Analytics: {interfaceContext.canViewAnalytics ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Test Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">API Tests</h2>
          <div className="flex items-center space-x-4">
            <Button 
              variant="default" 
              onClick={runTests}
              disabled={isTesting}
            >
              {isTesting ? 'Running Tests...' : 'Run API Tests'}
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => setTestResults({})}
            >
              Clear Results
            </Button>
          </div>
        </div>

        {/* Test Results */}
        {Object.keys(testResults).length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Results</h2>
            <div className="space-y-4">
              {Object.entries(testResults).map(([testName, result]: [string, any]) => (
                <div key={testName} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2 capitalize">
                    {testName.replace(/([A-Z])/g, ' $1').trim()}
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant={result.success ? 'default' : 'destructive'}>
                        {result.success ? 'PASS' : 'FAIL'}
                      </Badge>
                      <span className="text-sm text-gray-600">Status: {result.status}</span>
                    </div>
                    {result.data && (
                      <div className="text-sm text-gray-600">
                        <pre className="bg-gray-50 p-2 rounded text-xs overflow-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </div>
                    )}
                    {result.error && (
                      <div className="text-sm text-red-600">
                        Error: {result.error.toString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Enhanced Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/">
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <EyeIcon className="h-6 w-6 text-blue-600" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Enhanced Dashboard</h3>
                    <p className="text-xs text-gray-500">View the improved client dashboard</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/ready-content">
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <DocumentTextIcon className="h-6 w-6 text-green-600" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Ready Content</h3>
                    <p className="text-xs text-gray-500">Review content pending approval</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/approved">
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Approved Content</h3>
                    <p className="text-xs text-gray-500">View recently approved content</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/ideas">
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <LightBulbIcon className="h-6 w-6 text-yellow-600" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Ideas</h3>
                    <p className="text-xs text-gray-500">Review and approve content ideas</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/feedback-management">
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <ChatBubbleLeftIcon className="h-6 w-6 text-purple-600" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Feedback Management</h3>
                    <p className="text-xs text-gray-500">Manage content feedback</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/admin/organizations">
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <BuildingOfficeIcon className="h-6 w-6 text-indigo-600" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Organizations</h3>
                    <p className="text-xs text-gray-500">Manage organizations (Admin only)</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Phase 2 Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Phase 2 Enhancements Summary</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">✅ Enhanced Client Dashboard</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Improved stats with 6 key metrics</li>
                  <li>• Priority indicators and due dates</li>
                  <li>• Better visual hierarchy and modern design</li>
                  <li>• Quick action buttons with proper navigation</li>
                  <li>• Real-time data integration</li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">✅ New API Endpoints</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• /api/client/stats - Dashboard statistics</li>
                  <li>• /api/ready-content - Content pending review</li>
                  <li>• /api/approved - Recently approved content</li>
                  <li>• Proper error handling and logging</li>
                  <li>• Organization-based data isolation</li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">✅ Improved UI Components</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Enhanced Badge component with proper variants</li>
                  <li>• Better Button component with icons</li>
                  <li>• Improved ReadyContentList for client view</li>
                  <li>• Role-specific content and actions</li>
                  <li>• Responsive design improvements</li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">✅ Role-Based Features</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Client-specific navigation and actions</li>
                  <li>• Priority-based content sorting</li>
                  <li>• Overdue item highlighting</li>
                  <li>• Enhanced feedback workflow</li>
                  <li>• Better content type indicators</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 