'use client'

import { useSession } from 'next-auth/react'

import { useInterface } from '@/hooks/useInterface'
import { useOrganization } from '@/lib/contexts/OrganizationContext'
import OrganizationSwitcher from '@/components/navigation/OrganizationSwitcher'

export default function TestAdminOrganizationSwitcher() {
  const { data: session } = useSession()
  const interfaceContext = useInterface()
  const { currentOrganization, userOrganizations, isLoading } = useOrganization()

  if (!session) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Test Admin Organization Switcher</h1>
        <p>Please sign in to test the organization switcher.</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Admin Organization Switcher</h1>
      
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">User Information</h2>
          <div className="space-y-2">
            <p><strong>Name:</strong> {session.user.name}</p>
            <p><strong>Email:</strong> {session.user.email}</p>
            <p><strong>Role:</strong> {session.user.role}</p>
            <p><strong>Is Admin:</strong> {interfaceContext.isAdmin ? 'Yes' : 'No'}</p>
          </div>
        </div>

        {interfaceContext.isAdmin && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Organization Switcher Test</h2>
            <div className="mb-4">
              <OrganizationSwitcher />
            </div>
            
            <div className="space-y-2">
              <p><strong>Current Organization:</strong> {currentOrganization?.name || 'None'}</p>
              <p><strong>Total Organizations:</strong> {userOrganizations.length}</p>
              <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
            </div>
            
            <div className="mt-4">
              <h3 className="font-medium mb-2">Available Organizations:</h3>
              <ul className="space-y-1">
                {userOrganizations.map((org) => (
                  <li key={org.id} className="text-sm">
                    {org.name} {currentOrganization?.id === org.id ? '(Current)' : ''}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {!interfaceContext.isAdmin && (
          <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
            <h2 className="text-lg font-semibold mb-2 text-yellow-800">Access Restricted</h2>
            <p className="text-yellow-700">
              This test page is only available to admin users. Your current role is: {session.user.role}
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 