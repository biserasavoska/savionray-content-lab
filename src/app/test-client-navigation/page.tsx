'use client'

import { useSession } from 'next-auth/react'
import { useInterface } from '@/hooks/useInterface'
import { useOrganization } from '@/lib/contexts/OrganizationContext'
import ClientNavigationSwitcher from '@/components/navigation/ClientNavigationSwitcher'
import OrganizationSwitcher from '@/components/navigation/OrganizationSwitcher'

export default function TestClientNavigation() {
  const { data: session } = useSession()
  const interfaceContext = useInterface()
  const { currentOrganization, userOrganizations, isLoading } = useOrganization()

  if (!session) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Test Client Navigation</h1>
        <p>Please sign in to test the client navigation functionality.</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Client Navigation</h1>
      
      <div className="space-y-6">
        {/* User Information */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">User Information</h2>
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
              <span className="font-medium">Is Creative:</span> {interfaceContext.isCreative ? 'Yes' : 'No'}
            </div>
            <div>
              <span className="font-medium">Is Admin:</span> {interfaceContext.isAdmin ? 'Yes' : 'No'}
            </div>
          </div>
        </div>

        {/* Current Organization */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Current Organization</h2>
          {isLoading ? (
            <p className="text-gray-500">Loading organization...</p>
          ) : currentOrganization ? (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Name:</span> {currentOrganization.name}
              </div>
              <div>
                <span className="font-medium">Slug:</span> {currentOrganization.slug}
              </div>
              <div>
                <span className="font-medium">ID:</span> {currentOrganization.id}
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No organization selected</p>
          )}
        </div>

        {/* User Organizations */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">User Organizations ({userOrganizations.length})</h2>
          {userOrganizations.length > 0 ? (
            <div className="space-y-2">
              {userOrganizations.map((org: any) => (
                <div key={org.id} className="p-2 bg-gray-50 rounded text-sm">
                  <div className="font-medium">{org.name}</div>
                  <div className="text-gray-600">Role: {org.role}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No organizations found</p>
          )}
        </div>

        {/* Client Navigation Switcher */}
        {(interfaceContext.isCreative || interfaceContext.isAdmin) && (
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">Client Navigation Switcher</h2>
            <p className="text-sm text-gray-600 mb-4">
              This component allows Creative and Admin users to easily navigate between clients.
            </p>
            <div className="flex justify-center">
              <ClientNavigationSwitcher />
            </div>
          </div>
        )}

        {/* Organization Switcher (Admin only) */}
        {interfaceContext.isAdmin && (
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">Organization Switcher (Admin)</h2>
            <p className="text-sm text-gray-600 mb-4">
              This component is only visible to Admin users for organization management.
            </p>
            <div className="flex justify-center">
              <OrganizationSwitcher />
            </div>
          </div>
        )}

        {/* Access Control Test */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Access Control Test</h2>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Can see Client Navigation:</span> 
              {(interfaceContext.isCreative || interfaceContext.isAdmin) ? 'Yes' : 'No'}
            </div>
            <div>
              <span className="font-medium">Can see Organization Switcher:</span> 
              {interfaceContext.isAdmin ? 'Yes' : 'No'}
            </div>
            <div>
              <span className="font-medium">User Role:</span> {interfaceContext.userRole}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 