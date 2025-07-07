'use client'

import { useState } from 'react'

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
  user: User
}

interface Organization {
  id: string
  name: string
  slug: string
  users: OrganizationUser[]
}

interface OrganizationWithUsers extends Organization {
  users: OrganizationUser[]
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

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'OWNER':
        return 'bg-purple-100 text-purple-800'
      case 'ADMIN':
        return 'bg-red-100 text-red-800'
      case 'MANAGER':
        return 'bg-blue-100 text-blue-800'
      case 'MEMBER':
        return 'bg-green-100 text-green-800'
      case 'VIEWER':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Team Members ({organization.users.length})</h3>
          <button
            type="button"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Invite Member
          </button>
        </div>
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
          {organization.users.map((orgUser) => (
            <div key={orgUser.id} className="px-6 py-4">
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* User Info */}
                <div className="col-span-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      {orgUser.user.image ? (
                        <img
                          src={orgUser.user.image}
                          alt={orgUser.user.name || ''}
                          className="h-10 w-10 rounded-full"
                        />
                      ) : (
                        <span className="text-sm font-medium text-gray-600">
                          {orgUser.user.name?.[0] || orgUser.user.email?.[0] || '?'}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{orgUser.user.name}</p>
                      <p className="text-sm text-gray-500">{orgUser.user.email}</p>
                    </div>
                  </div>
                </div>

                {/* Organization Role */}
                <div className="col-span-3">
                  <select
                    value={orgUser.role}
                    onChange={(e) => handleRoleChange(orgUser.userId, e.target.value)}
                    disabled={isLoading || orgUser.role === 'OWNER'}
                    className="block w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
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
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(orgUser.user.role)}`}>
                    {orgUser.user.role.toLowerCase()}
                  </span>
                </div>

                {/* Actions */}
                <div className="col-span-2">
                  {orgUser.role !== 'OWNER' && (
                    <button
                      onClick={() => handleRemoveUser(orgUser.userId)}
                      disabled={isLoading}
                      className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                    >
                      Remove
                    </button>
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
    </div>
  )
} 