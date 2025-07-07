'use client'

import { useSession } from 'next-auth/react'
import { useInterface, useFeatureAccess } from '@/hooks/useInterface'
import RoleBasedLayout from '@/components/layouts/RoleBasedLayout'

export default function TestInterfacesPage() {
  const { data: session } = useSession()
  const interfaceContext = useInterface()

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h2>
          <p className="text-gray-600">You need to be signed in to test the interfaces.</p>
        </div>
      </div>
    )
  }

  return (
    <RoleBasedLayout allowedRoles={['CLIENT', 'CREATIVE', 'ADMIN']}>
      <div className="p-6 space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Role-Based Interface Test</h1>
          
          {/* User Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Current User</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Name:</span> {session.user.name}
              </div>
              <div>
                <span className="font-medium">Email:</span> {session.user.email}
              </div>
              <div>
                <span className="font-medium">Role:</span> {session.user.role}
              </div>
              <div>
                <span className="font-medium">Organization Type:</span> {interfaceContext.organizationType || 'Unknown'}
              </div>
            </div>
          </div>

          {/* Interface Context */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Interface Context</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center">
                <span className={`w-3 h-3 rounded-full mr-2 ${interfaceContext.isClient ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                <span className="font-medium">Is Client:</span> {interfaceContext.isClient ? 'Yes' : 'No'}
              </div>
              <div className="flex items-center">
                <span className={`w-3 h-3 rounded-full mr-2 ${interfaceContext.isAgency ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                <span className="font-medium">Is Agency:</span> {interfaceContext.isAgency ? 'Yes' : 'No'}
              </div>
              <div className="flex items-center">
                <span className={`w-3 h-3 rounded-full mr-2 ${interfaceContext.isCreative ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                <span className="font-medium">Is Creative:</span> {interfaceContext.isCreative ? 'Yes' : 'No'}
              </div>
              <div className="flex items-center">
                <span className={`w-3 h-3 rounded-full mr-2 ${interfaceContext.isAdmin ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                <span className="font-medium">Is Admin:</span> {interfaceContext.isAdmin ? 'Yes' : 'No'}
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="mb-6 p-4 bg-green-50 rounded-lg">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Permissions</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center">
                <span className={`w-3 h-3 rounded-full mr-2 ${interfaceContext.canCreateContent ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                <span className="font-medium">Create Content:</span> {interfaceContext.canCreateContent ? 'Yes' : 'No'}
              </div>
              <div className="flex items-center">
                <span className={`w-3 h-3 rounded-full mr-2 ${interfaceContext.canApproveContent ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                <span className="font-medium">Approve Content:</span> {interfaceContext.canApproveContent ? 'Yes' : 'No'}
              </div>
              <div className="flex items-center">
                <span className={`w-3 h-3 rounded-full mr-2 ${interfaceContext.canManageTeam ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                <span className="font-medium">Manage Team:</span> {interfaceContext.canManageTeam ? 'Yes' : 'No'}
              </div>
              <div className="flex items-center">
                <span className={`w-3 h-3 rounded-full mr-2 ${interfaceContext.canViewAnalytics ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                <span className="font-medium">View Analytics:</span> {interfaceContext.canViewAnalytics ? 'Yes' : 'No'}
              </div>
              <div className="flex items-center">
                <span className={`w-3 h-3 rounded-full mr-2 ${interfaceContext.canManageBilling ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                <span className="font-medium">Manage Billing:</span> {interfaceContext.canManageBilling ? 'Yes' : 'No'}
              </div>
            </div>
          </div>

          {/* Feature Access */}
          <div className="mb-6 p-4 bg-purple-50 rounded-lg">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Feature Access</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              {[
                'content-creation',
                'content-approval', 
                'team-management',
                'analytics',
                'billing',
                'client-dashboard',
                'agency-dashboard'
              ].map(feature => (
                <div key={feature} className="flex items-center">
                  <span className={`w-3 h-3 rounded-full mr-2 ${useFeatureAccess(feature) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                  <span className="font-medium">{feature}:</span> {useFeatureAccess(feature) ? 'Yes' : 'No'}
                </div>
              ))}
            </div>
          </div>

          {/* Role-Specific Content */}
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Role-Specific Content</h2>
            
            {interfaceContext.isClient && (
              <div className="text-sm text-gray-700">
                <p className="mb-2">🎯 <strong>Client Interface:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Focused on content review and approval</li>
                  <li>Simplified navigation with client-specific features</li>
                  <li>Dashboard shows pending content and approval status</li>
                  <li>Limited to viewing and approving content</li>
                </ul>
              </div>
            )}

            {interfaceContext.isAgency && (
              <div className="text-sm text-gray-700">
                <p className="mb-2">🏢 <strong>Agency Interface:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Full content creation and management capabilities</li>
                  <li>Access to all features and tools</li>
                  <li>Dashboard shows comprehensive stats and activity</li>
                  <li>Can manage multiple clients and team members</li>
                </ul>
              </div>
            )}

            {interfaceContext.isCreative && (
              <div className="text-sm text-gray-700 mt-2">
                <p className="mb-2">🎨 <strong>Creative Role:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Can create and edit content</li>
                  <li>Access to content creation tools</li>
                  <li>Can view analytics and performance data</li>
                  <li>Cannot manage team or billing</li>
                </ul>
              </div>
            )}

            {interfaceContext.isAdmin && (
              <div className="text-sm text-gray-700 mt-2">
                <p className="mb-2">👑 <strong>Admin Role:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Full system access and control</li>
                  <li>Can manage team members and permissions</li>
                  <li>Access to billing and organization settings</li>
                  <li>Can view all analytics and system data</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </RoleBasedLayout>
  )
} 