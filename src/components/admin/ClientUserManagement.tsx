'use client'

import { useState, useEffect } from 'react'
import { User, OrganizationUser } from '@prisma/client'

interface ClientUser {
  id: string
  name: string
  email: string
  role: string
  organizationRole: string
  joinedAt: string
  isActive: boolean
  lastActive?: string
}

interface ClientUserManagementProps {
  organizationId: string
  organizationName: string
}

export default function ClientUserManagement({ organizationId, organizationName }: ClientUserManagementProps) {
  const [users, setUsers] = useState<ClientUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<ClientUser | null>(null)
  const [isEditingRole, setIsEditingRole] = useState(false)
  const [newRole, setNewRole] = useState('')
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [isAddingUser, setIsAddingUser] = useState(false)
  const [addUserForm, setAddUserForm] = useState({
    name: '',
    email: '',
    systemRole: 'CLIENT',
    organizationRole: 'MEMBER'
  })

  useEffect(() => {
    fetchUsers()
  }, [organizationId])

  const fetchUsers = async () => {
    try {
      const response = await fetch(`/api/admin/organizations/${organizationId}/users`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch users')
      }

      setUsers(data.users)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddUser = async () => {
    if (!addUserForm.name || !addUserForm.email) {
      setError('Name and email are required')
      return
    }

    setIsAddingUser(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/organizations/${organizationId}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addUserForm),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to add user')
      }

      // Refresh users list
      await fetchUsers()
      
      // Reset form and close modal
      setAddUserForm({
        name: '',
        email: '',
        systemRole: 'CLIENT',
        organizationRole: 'MEMBER'
      })
      setShowAddUserModal(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add user')
    } finally {
      setIsAddingUser(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/organizations/${organizationId}/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      })

      if (!response.ok) {
        throw new Error('Failed to update user role')
      }

      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, organizationRole: newRole } : user
      ))
      
      setIsEditingRole(false)
      setSelectedUser(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user role')
    }
  }

  const handleDeactivateUser = async (userId: string) => {
    if (!confirm('Are you sure you want to deactivate this user?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/organizations/${organizationId}/users/${userId}/deactivate`, {
        method: 'PUT',
      })

      if (!response.ok) {
        throw new Error('Failed to deactivate user')
      }

      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, isActive: false } : user
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deactivate user')
    }
  }

  const handleActivateUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/organizations/${organizationId}/users/${userId}/activate`, {
        method: 'PUT',
      })

      if (!response.ok) {
        throw new Error('Failed to activate user')
      }

      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, isActive: true } : user
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to activate user')
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

  const getSystemRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800'
      case 'CLIENT':
        return 'bg-blue-100 text-blue-800'
      case 'CREATIVE':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-700">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Client Users</h2>
          <p className="text-sm text-gray-600">
            Manage users for {organizationName}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            {users.length} user{users.length !== 1 ? 's' : ''}
          </div>
          <button
            onClick={() => setShowAddUserModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add User
          </button>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  System Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organization Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className={!user.isActive ? 'bg-gray-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSystemRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {selectedUser?.id === user.id && isEditingRole ? (
                      <div className="flex items-center space-x-2">
                        <select
                          value={newRole}
                          onChange={(e) => setNewRole(e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="OWNER">Owner</option>
                          <option value="ADMIN">Admin</option>
                          <option value="MANAGER">Manager</option>
                          <option value="MEMBER">Member</option>
                          <option value="VIEWER">Viewer</option>
                        </select>
                        <button
                          onClick={() => handleRoleChange(user.id, newRole)}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingRole(false)
                            setSelectedUser(null)
                          }}
                          className="text-xs text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.organizationRole)}`}>
                          {user.organizationRole}
                        </span>
                        <button
                          onClick={() => {
                            setSelectedUser(user)
                            setNewRole(user.organizationRole)
                            setIsEditingRole(true)
                          }}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.joinedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {user.isActive ? (
                      <button
                        onClick={() => handleDeactivateUser(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        onClick={() => handleActivateUser(user.id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Activate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {users.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-500">No users have been added to this organization yet.</p>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New User</h3>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={(e) => { e.preventDefault(); handleAddUser(); }} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={addUserForm.name}
                    onChange={(e) => setAddUserForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={addUserForm.email}
                    onChange={(e) => setAddUserForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="systemRole" className="block text-sm font-medium text-gray-700 mb-1">
                    System Role
                  </label>
                  <select
                    id="systemRole"
                    value={addUserForm.systemRole}
                    onChange={(e) => setAddUserForm(prev => ({ ...prev, systemRole: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="CLIENT">Client</option>
                    <option value="CREATIVE">Creative</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="organizationRole" className="block text-sm font-medium text-gray-700 mb-1">
                    Organization Role
                  </label>
                  <select
                    id="organizationRole"
                    value={addUserForm.organizationRole}
                    onChange={(e) => setAddUserForm(prev => ({ ...prev, organizationRole: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="MEMBER">Member</option>
                    <option value="VIEWER">Viewer</option>
                    <option value="MANAGER">Manager</option>
                    <option value="ADMIN">Admin</option>
                    <option value="OWNER">Owner</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddUserModal(false)}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAddingUser}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAddingUser ? 'Adding...' : 'Add User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 