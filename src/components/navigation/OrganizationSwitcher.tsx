'use client'

// ⚠️ NOT TO BE USED - This is the WRONG organization switcher component
// The correct one is the client navigation switcher that shows "Dvanjoy" etc.
// This component should not be used for the organization switcher positioning task

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  ChevronDownIcon, 
  BuildingOfficeIcon,
  CheckIcon,
  PlusIcon
} from '@heroicons/react/24/outline'

import { useOrganization } from '@/lib/contexts/OrganizationContext'
import Button from '@/components/ui/common/Button'

interface Organization {
  id: string
  name: string
  slug: string
  domain?: string
  logo?: string
  primaryColor?: string
  subscriptionPlan: string
  subscriptionStatus: string
  maxUsers: number
  maxStorageGB: number
  _aggr_count_ideas: number
  _aggr_count_contentDrafts: number
  _aggr_count_deliveryPlans: number
  _aggr_count_contentItems: number
}

export default function OrganizationSwitcher() {
  const { data: session } = useSession()
  const router = useRouter()
  const { currentOrganization, setCurrentOrganization, userOrganizations, isLoading } = useOrganization()
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleOrganizationSwitch = async (organization: Organization) => {
    setLoading(true)
    try {
      setCurrentOrganization(organization)
      setIsOpen(false)
      
      // Use a more gentle approach that doesn't break development server
      // Instead of router.refresh(), we'll let the context update naturally
      // The organization context will trigger re-renders of components that depend on it
    } catch (error) {
      console.error('Failed to switch organization:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateOrganization = () => {
    router.push('/admin/organizations')
    setIsOpen(false)
  }

  if (!session?.user) {
    return null
  }

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
        <span className="text-sm text-gray-500">Loading...</span>
      </div>
    )
  }

  if (userOrganizations.length === 0) {
    return (
      <div className="flex items-center space-x-2">
        <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
        <span className="text-sm text-gray-500">No organizations</span>
      </div>
    )
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900"
        disabled={loading}
      >
        <BuildingOfficeIcon className="h-4 w-4" />
        <span className="truncate max-w-32">
          {currentOrganization?.name || 'Select Organization'}
        </span>
        <ChevronDownIcon className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-200 z-50">
          <div className="py-1">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
              Organizations
            </div>
            
                         {userOrganizations.map((org: Organization) => (
              <button
                key={org.id}
                onClick={() => handleOrganizationSwitch(org)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${
                  currentOrganization?.id === org.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
                disabled={loading}
              >
                <div className="flex items-center space-x-2">
                  <BuildingOfficeIcon className="h-4 w-4" />
                  <span className="truncate">{org.name}</span>
                </div>
                {currentOrganization?.id === org.id && (
                  <CheckIcon className="h-4 w-4 text-blue-600" />
                )}
              </button>
            ))}
            
            {session.user.role === 'ADMIN' && (
              <>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={handleCreateOrganization}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Create New Organization</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 