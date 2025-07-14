'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface OrganizationSelectorProps {
  selectedOrganizationId?: string
  onOrganizationChange: (organizationId: string) => void
  showLabel?: boolean
  disabled?: boolean
  className?: string
}

interface UserOrganization {
  id: string
  name: string
  slug: string
  primaryColor?: string
  role: string
}

export default function OrganizationSelector({
  selectedOrganizationId,
  onOrganizationChange,
  showLabel = true,
  disabled = false,
  className = ''
}: OrganizationSelectorProps) {
  const { data: session } = useSession()
  const [organizations, setOrganizations] = useState<UserOrganization[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/organization/list')
        
        if (!response.ok) {
          throw new Error('Failed to fetch organizations')
        }
        
        const data = await response.json()
        setOrganizations(data.organizations || [])
        
        // Auto-select first organization if none selected
        if (!selectedOrganizationId && data.organizations?.length > 0) {
          onOrganizationChange(data.organizations[0].id)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load organizations')
      } finally {
        setLoading(false)
      }
    }

    if (session?.user) {
      fetchOrganizations()
    }
  }, [session, selectedOrganizationId, onOrganizationChange])

  if (loading) {
    return (
      <div className={`${className}`}>
        {showLabel && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Organization
          </label>
        )}
        <div className="animate-pulse bg-gray-200 h-10 rounded-md"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`${className}`}>
        {showLabel && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Organization
          </label>
        )}
        <div className="text-red-600 text-sm">{error}</div>
      </div>
    )
  }

  if (organizations.length === 0) {
    return (
      <div className={`${className}`}>
        {showLabel && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Organization
          </label>
        )}
        <div className="text-gray-500 text-sm">No organizations available</div>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      {showLabel && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Organization
        </label>
      )}
      <select
        value={selectedOrganizationId || ''}
        onChange={(e) => onOrganizationChange(e.target.value)}
        disabled={disabled || organizations.length === 1}
        className={`
          block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${organizations.length === 1 ? 'bg-gray-50' : 'bg-white'}
        `}
      >
        {organizations.map((org) => (
          <option key={org.id} value={org.id}>
            {org.name} {org.role !== 'MEMBER' ? `(${org.role})` : ''}
          </option>
        ))}
      </select>
      {organizations.length === 1 && (
        <p className="mt-1 text-xs text-gray-500">
          You only have access to one organization
        </p>
      )}
    </div>
  )
} 