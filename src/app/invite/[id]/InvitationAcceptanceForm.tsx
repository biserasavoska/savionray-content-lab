'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Invitation {
  id: string
  email: string
  role: string
  message: string | null
  status: string
  expiresAt: Date
  organization: {
    id: string
    name: string
    slug: string
  }
  invitedByUser: {
    name: string | null
    email: string | null
  }
}

interface InvitationAcceptanceFormProps {
  invitation: Invitation
  userEmail: string
}

export default function InvitationAcceptanceForm({ 
  invitation, 
  userEmail 
}: InvitationAcceptanceFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAccept = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/organization/invite/${invitation.id}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to accept invitation')
      }

      // Redirect to the organization dashboard
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept invitation')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDecline = async () => {
    if (!confirm('Are you sure you want to decline this invitation?')) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/organization/invite/${invitation.id}/decline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error('Failed to decline invitation')
      }

      // Redirect to dashboard
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to decline invitation')
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleDisplay = (role: string) => {
    const roleMap: Record<string, string> = {
      OWNER: 'Owner',
      ADMIN: 'Administrator',
      MANAGER: 'Manager',
      MEMBER: 'Member',
      VIEWER: 'Viewer'
    }
    return roleMap[role] || role
  }

  return (
    <div className="space-y-6">
      {/* Invitation Details */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-sm font-medium text-blue-700">
                {invitation.organization.name[0]}
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-gray-900">
              {invitation.organization.name}
            </h3>
            <p className="text-sm text-gray-600">
              Invited by {invitation.invitedByUser.name || invitation.invitedByUser.email}
            </p>
            <p className="text-sm text-gray-600">
              Role: <span className="font-medium">{getRoleDisplay(invitation.role)}</span>
            </p>
            {invitation.message && (
              <p className="text-sm text-gray-600 mt-2">
                "{invitation.message}"
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Email Confirmation */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-600">
          This invitation is for: <span className="font-medium">{userEmail}</span>
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Expires: {new Date(invitation.expiresAt).toLocaleDateString()}
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={handleAccept}
          disabled={isLoading}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Accepting...' : 'Accept Invitation'}
        </button>
        
        <button
          onClick={handleDecline}
          disabled={isLoading}
          className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Declining...' : 'Decline'}
        </button>
      </div>

      {/* Additional Info */}
      <div className="text-xs text-gray-500 text-center">
        <p>By accepting this invitation, you'll be added to the organization with the specified role.</p>
        <p className="mt-1">You can manage your organization settings after joining.</p>
      </div>
    </div>
  )
} 