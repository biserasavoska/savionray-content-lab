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
  ErrorDisplay,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
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
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [inviteFormData, setInviteFormData] = useState({
    email: '',
    name: '',
    role: 'MEMBER',
    message: ''
  })
  const [isInviting, setIsInviting] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null)
  const [inviteMode, setInviteMode] = useState<'email' | 'search'>('email')
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any | null>(null)

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

  const handleInviteInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setInviteFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleUserSearch = async (query: string) => {
    setUserSearchQuery(query)
    
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(`/api/admin/users?search=${encodeURIComponent(query)}&limit=10`)
      if (response.ok) {
        const data = await response.json()
        // Filter out users already in this organization
        const existingUserIds = organization?.OrganizationUser.map(ou => ou.userId) || []
        const filteredUsers = data.users.filter((user: any) => !existingUserIds.includes(user.id))
        setSearchResults(filteredUsers)
      }
    } catch (error) {
      console.error('Error searching users:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectUser = (user: any) => {
    setSelectedUser(user)
    setInviteFormData(prev => ({
      ...prev,
      email: user.email,
      name: user.name || ''
    }))
    setUserSearchQuery('')
    setSearchResults([])
  }

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsInviting(true)
    setInviteError(null)
    setInviteSuccess(null)

    try {
      const response = await fetch('/api/organization/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-selected-organization': organizationId,
        },
        body: JSON.stringify({
          email: inviteFormData.email,
          role: inviteFormData.role,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invitation')
      }

      setInviteSuccess('Invitation sent successfully!')
      setInviteFormData({
        email: '',
        name: '',
        role: 'MEMBER',
        message: ''
      })
      setSelectedUser(null)
      setUserSearchQuery('')
      setSearchResults([])
      
      // Refresh the organization data to show the new invitation
      await fetchOrganizationData()
      
      // Close dialog after a short delay
      setTimeout(() => {
        setShowInviteDialog(false)
        setInviteSuccess(null)
      }, 1500)
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : 'Failed to send invitation')
    } finally {
      setIsInviting(false)
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
            <Button 
              variant="default" 
              size="sm"
              onClick={() => setShowInviteDialog(true)}
            >
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

      {/* Invite Member Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={(open) => {
        setShowInviteDialog(open)
        if (!open) {
          // Reset form when closing
          setInviteFormData({
            email: '',
            name: '',
            role: 'MEMBER',
            message: ''
          })
          setSelectedUser(null)
          setUserSearchQuery('')
          setSearchResults([])
          setInviteError(null)
          setInviteSuccess(null)
          setInviteMode('email')
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation to join {organizationName}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleInviteSubmit} className="px-6 py-4 space-y-4">
            {/* Mode Toggle */}
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => {
                  setInviteMode('email')
                  setSelectedUser(null)
                  setUserSearchQuery('')
                  setSearchResults([])
                }}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md ${
                  inviteMode === 'email'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Invite by Email
              </button>
              <button
                type="button"
                onClick={() => {
                  setInviteMode('search')
                  setInviteFormData(prev => ({ ...prev, email: '', name: '' }))
                }}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md ${
                  inviteMode === 'search'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Search Existing User
              </button>
            </div>

            {inviteMode === 'search' ? (
              <div className="space-y-2">
                <label htmlFor="user-search" className="block text-sm font-medium text-gray-700 mb-1">
                  Search Users *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="user-search"
                    value={userSearchQuery}
                    onChange={(e) => handleUserSearch(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search by name or email..."
                    required={!selectedUser}
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-2.5">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                </div>

                {/* Search Results */}
                {userSearchQuery.length >= 2 && searchResults.length > 0 && !selectedUser && (
                  <div className="border border-gray-200 rounded-md max-h-48 overflow-y-auto bg-white">
                    {searchResults.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleSelectUser(user)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{user.name || 'No name'}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                            {user.role}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {userSearchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
                  <p className="text-sm text-gray-500">No users found</p>
                )}

                {/* Selected User Display */}
                {selectedUser && (
                  <div className="border border-blue-200 bg-blue-50 rounded-md p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{selectedUser.name || 'No name'}</p>
                        <p className="text-xs text-gray-600">{selectedUser.email}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedUser(null)
                          setInviteFormData(prev => ({ ...prev, email: '', name: '' }))
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                )}

                {/* Hidden email input for form validation */}
                <input
                  type="hidden"
                  name="email"
                  value={inviteFormData.email}
                  required
                />
              </div>
            ) : (
              <div>
                <label htmlFor="invite-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="invite-email"
                  name="email"
                  required
                  value={inviteFormData.email}
                  onChange={handleInviteInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="user@example.com"
                />
              </div>
            )}

            {inviteMode === 'email' && (
              <div>
                <label htmlFor="invite-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name (Optional)
                </label>
                <input
                  type="text"
                  id="invite-name"
                  name="name"
                  value={inviteFormData.name}
                  onChange={handleInviteInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Full Name"
                />
              </div>
            )}

            <div>
              <label htmlFor="invite-role" className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                id="invite-role"
                name="role"
                value={inviteFormData.role}
                onChange={handleInviteInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="MEMBER">Member</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Admin</option>
                <option value="VIEWER">Viewer</option>
              </select>
            </div>

            <div>
              <label htmlFor="invite-message" className="block text-sm font-medium text-gray-700 mb-1">
                Personal Message (Optional)
              </label>
              <textarea
                id="invite-message"
                name="message"
                rows={3}
                value={inviteFormData.message}
                onChange={handleInviteInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add a personal message to the invitation..."
              />
            </div>

            {inviteError && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                {inviteError}
              </div>
            )}

            {inviteSuccess && (
              <div className="text-green-600 text-sm bg-green-50 p-3 rounded-md">
                {inviteSuccess}
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowInviteDialog(false)
                  setInviteError(null)
                  setInviteSuccess(null)
                  setInviteFormData({
                    email: '',
                    name: '',
                    role: 'MEMBER',
                    message: ''
                  })
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isInviting}
                variant="default"
              >
                {isInviting ? 'Sending...' : 'Send Invitation'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageLayout>
  )
}
