'use client'

import { useState, useEffect } from 'react'

interface Invitation {
  id: string
  email: string
  role: string
  message: string | null
  status: string
  expiresAt: string
  createdAt: string
  invitedByUser: {
    name: string | null
    email: string | null
  }
}

interface InvitationManagementListProps {}

export default function InvitationManagementList({}: InvitationManagementListProps) {
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInvitations = async () => {
    try {
      const response = await fetch('/api/organization/invite?status=PENDING')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch invitations')
      }

      setInvitations(data.invitations || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch invitations')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendInvitation = async (invitationId: string) => {
    try {
      const response = await fetch(`/api/organization/invite/${invitationId}/resend`, {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Failed to resend invitation')
      }

      // Refresh the list
      await fetchInvitations()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend invitation')
    }
  }

  const handleCancelInvitation = async (invitationId: string) => {
    if (!confirm('Are you sure you want to cancel this invitation?')) {
      return
    }

    try {
      const response = await fetch(`/api/organization/invite/${invitationId}/cancel`, {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Failed to cancel invitation')
      }

      // Refresh the list
      await fetchInvitations()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel invitation')
    }
  }

  useEffect(() => {
    fetchInvitations()
  }, [])

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      ACCEPTED: { color: 'bg-green-100 text-green-800', text: 'Accepted' },
      DECLINED: { color: 'bg-red-100 text-red-800', text: 'Declined' },
      EXPIRED: { color: 'bg-gray-100 text-gray-800', text: 'Expired' }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    )
  }

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      OWNER: { color: 'bg-purple-100 text-purple-800', text: 'Owner' },
      ADMIN: { color: 'bg-red-100 text-red-800', text: 'Admin' },
      MANAGER: { color: 'bg-blue-100 text-blue-800', text: 'Manager' },
      MEMBER: { color: 'bg-green-100 text-green-800', text: 'Member' },
      VIEWER: { color: 'bg-gray-100 text-gray-800', text: 'Viewer' }
    }

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.MEMBER

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg">
      {invitations.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          <p>No pending invitations</p>
        </div>
      ) : (
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expires
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invitations.map((invitation) => (
                <tr key={invitation.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {invitation.email}
                    </div>
                    {invitation.message && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {invitation.message}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(invitation.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(invitation.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(invitation.expiresAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      {invitation.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleResendInvitation(invitation.id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Resend
                          </button>
                          <button
                            onClick={() => handleCancelInvitation(invitation.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
} 