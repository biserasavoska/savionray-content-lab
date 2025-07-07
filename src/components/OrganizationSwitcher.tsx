'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

interface Organization {
  id: string
  name: string
  slug: string
  primaryColor?: string | null
}

interface OrganizationSwitcherProps {
  currentOrganizationId: string
  onOrganizationChange: (organizationId: string) => void
}

export default function OrganizationSwitcher({ 
  currentOrganizationId, 
  onOrganizationChange 
}: OrganizationSwitcherProps) {
  const { data: session } = useSession()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await fetch('/api/organization/list')
        if (response.ok) {
          const data = await response.json()
          setOrganizations(data.organizations)
          
          const current = data.organizations.find((org: Organization) => org.id === currentOrganizationId)
          setCurrentOrg(current || data.organizations[0])
        }
      } catch (error) {
        console.error('Error fetching organizations:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session) {
      fetchOrganizations()
    }
  }, [session, currentOrganizationId])

  const handleOrganizationSelect = (organization: Organization) => {
    setCurrentOrg(organization)
    onOrganizationChange(organization.id)
    setIsOpen(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-500">
        <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
        <span>Loading...</span>
      </div>
    )
  }

  if (organizations.length <= 1) {
    return null // Don't show switcher if user only has one organization
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
      >
        <div 
          className="w-3 h-3 rounded-full"
          style={{ 
            backgroundColor: currentOrg?.primaryColor || '#3B82F6' 
          }}
        ></div>
        <span className="font-medium">{currentOrg?.name}</span>
        <ChevronDownIcon className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          <div className="py-1">
            <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Switch Organization
            </div>
            {organizations.map((org) => (
              <button
                key={org.id}
                onClick={() => handleOrganizationSelect(org)}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-sm text-left hover:bg-gray-50 ${
                  org.id === currentOrganizationId ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
              >
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ 
                    backgroundColor: org.primaryColor || '#3B82F6' 
                  }}
                ></div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{org.name}</div>
                  <div className="text-xs text-gray-500 truncate">@{org.slug}</div>
                </div>
                {org.id === currentOrganizationId && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 