'use client'

import { useState } from 'react'
import Button from '@/components/ui/common/Button'
import StatusBadge from '@/components/ui/common/StatusBadge'
import { PageLayout, PageHeader, PageContent, PageSection } from '@/components/ui/layout/PageLayout'

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

interface OrganizationWithUsers extends Organization {
  OrganizationUser: OrganizationUser[]
}

interface UserManagementListProps {
  organization: OrganizationWithUsers
}

export default function UserManagementList({ organization }: UserManagementListProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleRoleChange = async (userId: string, newRole: string) => {
    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch(`/api/organization/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      })

      if (response.ok) {
        setMessage('User role updated successfully!')
        // Refresh the page to show updated data
        window.location.reload()
      } else {
        const error = await response.json()
        setMessage(`Error: ${error.message}`)
      }
    } catch (error) {
      setMessage('An error occurred while updating user role')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveUser = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this user from the organization?')) {
      return
    }

    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch(`/api/organization/users/${userId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setMessage('User removed from organization successfully!')
        // Refresh the page to show updated data
        window.location.reload()
      } else {
        const error = await response.json()
        setMessage(`Error: ${error.message}`)
      }
    } catch (error) {
      setMessage('An error occurred while removing user')
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'OWNER':
        return 'purple'
      case 'ADMIN':
        return 'danger'
      case 'MANAGER':
        return 'info'
      case 'MEMBER':
        return 'success'
      case 'VIEWER':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  const getSystemRoleBadgeVariant = (role: string) => {
    switch (role.toLowerCase()) {
      case 'owner':
        return 'purple'
      case 'admin':
        return 'danger'
      case 'manager':
        return 'info'
      case 'member':
        return 'success'
      case 'viewer':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  return (
    <PageLayout>
      <PageHeader 
        title={`Team Members (${organization.OrganizationUser.length})`}
        description="Manage your organization's team members and their roles"
      />
      <PageContent>
        <PageSection>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Team Members ({organization.OrganizationUser.length})</h3>
              <p className="text-sm text-gray-600">Manage roles and permissions for your team</p>
            </div>
            <Button variant="primary" size="sm">
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
                      <select
                        value={orgUser.role}
                        onChange={(e) => handleRoleChange(orgUser.userId, e.target.value)}
                        disabled={isLoading || orgUser.role === 'OWNER'}
                        className="block w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 transition-colors duration-200 hover:border-gray-400"
                      >
                        <option value="OWNER">Owner</option>
                        <option value="ADMIN">Admin</option>
                        <option value="MANAGER">Manager</option>
                        <option value="MEMBER">Member</option>
                        <option value="VIEWER">Viewer</option>
                      </select>
                    </div>

                    {/* System Role */}
                    <div className="col-span-3">
                      <StatusBadge 
                        status={orgUser.User_OrganizationUser_userIdToUser.role.toLowerCase()} 
                        variant="rounded"
                        size="sm"
                      />
                    </div>

                    {/* Actions */}
                    <div className="col-span-2">
                      {orgUser.role !== 'OWNER' && (
                        <Button
                          onClick={() => handleRemoveUser(orgUser.userId)}
                          disabled={isLoading}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className={`mt-4 p-4 rounded-md ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {message}
            </div>
          )}
        </PageSection>
      </PageContent>
    </PageLayout>
  )
} 