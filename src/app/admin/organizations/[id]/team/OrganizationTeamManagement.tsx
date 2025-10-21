'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import {
  Button,
  StatusBadge,
  PageLayout,
  PageHeader,
  PageContent,
  PageSection,
  Select,
  ErrorDisplay
} from '@/components/ui/common'

interface User {
  id: string
  name: string | null
  email: string | null
  role: string
  image: string | null
}

interface OrganizationUser {
  id: string
  userId: string
  role: string
  isActive: boolean
  User_OrganizationUser_userIdToUser: User
}

interface Organization {
  id: string
  name: string
  slug: string
  OrganizationUser: OrganizationUser[]
}

interface OrganizationTeamManagementProps {
  organizationId: string
  organizationName: string
}

export default function OrganizationTeamManagement({ organizationId, organizationName }: OrganizationTeamManagementProps) {
  const { data: session } = useSession()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  useEffect(() => {
    fetchOrganizationData()
  }, [organizationId])

  const fetchOrganizationData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/organization/${organizationId}/users`, {
        headers: {
          'x-selected-organization': organizationId,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setOrganization(data)
      } else {
        setMessage('Failed to fetch organization data')
        setMessageType('error')
      }
    } catch (error) {
      console.error('Error fetching organization data:', error)
      setMessage('An error occurred while fetching organization data')
      setMessageType('error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    setIsUpdating(true)
    setMessage('')

    try {
      const response = await fetch(`/api/organization/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-selected-organization': organizationId,
        },
        body: JSON.stringify({ role: newRole }),
      })

      if (response.ok) {
        setMessage('User role updated successfully!')
        setMessageType('success')
        // Refresh the organization data
        await fetchOrganizationData()
      } else {
        const error = await response.json()
        setMessage(`Error: ${error.message}`)
        setMessageType('error')
      }
    } catch (error) {
      setMessage('An error occurred while updating user role')
      setMessageType('error')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSystemRoleChange = async (userId: string, newSystemRole: string) => {
    setIsUpdating(true)
    setMessage('')

    try {
      const response = await fetch(`/api/organization/users/${userId}/system-role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-selected-organization': organizationId,
        },
        body: JSON.stringify({ systemRole: newSystemRole }),
      })

      if (response.ok) {
        setMessage('User system role updated successfully!')
        setMessageType('success')
        // Refresh the organization data
        await fetchOrganizationData()
      } else {
        const error = await response.json()
        setMessage(`Error: ${error.message}`)
        setMessageType('error')
      }
    } catch (error) {
      setMessage('An error occurred while updating user system role')
      setMessageType('error')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRemoveUser = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this user from the organization?')) {
      return
    }

    setIsUpdating(true)
    setMessage('')

    try {
      const response = await fetch(`/api/organization/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'x-selected-organization': organizationId,
        },
      })

      if (response.ok) {
        setMessage('User removed from organization successfully!')
        setMessageType('success')
        // Refresh the organization data
        await fetchOrganizationData()
      } else {
        const error = await response.json()
        setMessage(`Error: ${error.message}`)
        setMessageType('error')
      }
    } catch (error) {
      setMessage('An error occurred while removing user')
      setMessageType('error')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to permanently delete this user? This action cannot be undone and will remove all user data.')) {
      return
    }

    setIsUpdating(true)
    setMessage('')

    try {
      const response = await fetch(`/api/organization/users/${userId}/delete`, {
        method: 'DELETE',
        headers: {
          'x-selected-organization': organizationId,
        },
      })

      if (response.ok) {
        setMessage('User permanently deleted successfully!')
        setMessageType('success')
        // Refresh the organization data
        await fetchOrganizationData()
      } else {
        const error = await response.json()
        setMessage(`Error: ${error.message}`)
        setMessageType('error')
      }
    } catch (error) {
      setMessage('An error occurred while deleting user')
      setMessageType('error')
    } finally {
      setIsUpdating(false)
    }
  }

  const roleOptions = [
    { value: 'OWNER', label: 'Owner' },
    { value: 'ADMIN', label: 'Admin' },
    { value: 'MANAGER', label: 'Manager' },
    { value: 'MEMBER', label: 'Member' },
    { value: 'VIEWER', label: 'Viewer' }
  ]

  const systemRoleOptions = [
    { value: 'ADMIN', label: 'Admin' },
    { value: 'CLIENT', label: 'Client' },
    { value: 'CREATIVE', label: 'Creative' }
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading team members...</span>
      </div>
    )
  }

  if (!organization) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No organization data available</p>
      </div>
    )
  }

  return (
    <PageLayout>
      <PageHeader 
        title={`Team Members (${organization.OrganizationUser.length})`}
        subtitle={`Manage team members for ${organizationName}`}
      />
      <PageContent>
        <PageSection>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Team Members ({organization.OrganizationUser.length})</h3>
              <p className="text-sm text-gray-600">Manage roles and permissions for your team</p>
            </div>
            <Button variant="default" size="sm">
              Invite Member
            </Button>
          </div>

          <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
            <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
                <div className="col-span-4">User</div>
                <div className="col-span-3">Organization Role</div>
                <div className="col-span-3">System Role</div>
                <div className="col-span-2">Actions</div>
              </div>
            </div>
            
            <div className="divide-y divide-gray-200">
              {organization.OrganizationUser.map((orgUser) => (
                <div key={orgUser.id} className="px-6 py-4">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* User Info */}
                    <div className="col-span-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          {orgUser.User_OrganizationUser_userIdToUser.image ? (
                            <img
                              src={orgUser.User_OrganizationUser_userIdToUser.image}
                              alt={orgUser.User_OrganizationUser_userIdToUser.name || ''}
                              className="h-10 w-10 rounded-full"
                            />
                          ) : (
                            <span className="text-sm font-medium text-gray-600">
                              {orgUser.User_OrganizationUser_userIdToUser.name?.[0] || orgUser.User_OrganizationUser_userIdToUser.email?.[0] || '?'}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{orgUser.User_OrganizationUser_userIdToUser.name}</p>
                          <p className="text-sm text-gray-500">{orgUser.User_OrganizationUser_userIdToUser.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Organization Role */}
                    <div className="col-span-3">
                      <Select
                        id={`org-role-${orgUser.userId}`}
                        options={roleOptions}
                        value={orgUser.role}
                        onChange={(e) => handleRoleChange(orgUser.userId, e.target.value)}
                        disabled={isUpdating || orgUser.role === 'OWNER'}
                      />
                    </div>

                    {/* System Role */}
                    <div className="col-span-3">
                      <Select
                        id={`system-role-${orgUser.userId}`}
                        options={systemRoleOptions}
                        value={orgUser.User_OrganizationUser_userIdToUser.role}
                        onChange={(e) => handleSystemRoleChange(orgUser.userId, e.target.value)}
                        disabled={isUpdating || orgUser.userId === session?.user?.id}
                      />
                    </div>

                    {/* Actions */}
                    <div className="col-span-2">
                      <div className="flex space-x-2">
                        {orgUser.role !== 'OWNER' && (
                          <>
                            <Button
                              onClick={() => handleRemoveUser(orgUser.userId)}
                              disabled={isUpdating}
                              variant="ghost"
                              size="sm"
                              className="text-orange-600 hover:text-orange-800"
                            >
                              Remove
                            </Button>
                            <Button
                              onClick={() => handleDeleteUser(orgUser.userId)}
                              disabled={isUpdating || orgUser.userId === session?.user?.id}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className="mt-4">
              {messageType === 'error' ? (
                <ErrorDisplay
                  title="Action Failed"
                  message={message}
                  variant="destructive"
                />
              ) : (
                <div className="p-4 bg-green-50 border border-green-200 rounded-md text-green-700">
                  {message}
                </div>
              )}
            </div>
          )}
        </PageSection>
      </PageContent>
    </PageLayout>
  )
}
