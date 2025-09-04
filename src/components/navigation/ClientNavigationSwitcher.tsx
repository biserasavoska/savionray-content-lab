'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  ChevronDownIcon, 
  BuildingOfficeIcon,
  CheckIcon,
  PlusIcon,
  UsersIcon,
  LightBulbIcon,
  DocumentTextIcon,
  ChartBarIcon,
  EyeIcon,
  CalendarIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline'

import { useOrganization } from '@/lib/contexts/OrganizationContext'
import { useInterface } from '@/hooks/useInterface'
import Button from '@/components/ui/common/Button'
import Badge from '@/components/ui/common/Badge'

interface ClientOrganization {
  id: string
  name: string
  slug: string
  domain?: string
  primaryColor?: string
  subscriptionPlan: string
  subscriptionStatus: string
  userCount: number
  stats: {
    ideas: number
    contentDrafts: number
    deliveryPlans: number
    contentItems: number
  }
  users: Array<{
    id: string
    name: string
    email: string
    systemRole: string
    organizationRole: string
  }>
}

export default function ClientNavigationSwitcher() {
  const { data: session } = useSession()
  const router = useRouter()
  const { currentOrganization, setCurrentOrganization, userOrganizations, isLoading } = useOrganization()
  const interfaceContext = useInterface()
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [clientOrganizations, setClientOrganizations] = useState<ClientOrganization[]>([])
  const [fetchingClients, setFetchingClients] = useState(false)

  // Only show for Creative and Admin users
  if (!interfaceContext.isCreative && !interfaceContext.isAdmin) {
    return null
  }

  // Fetch all client organizations for Creative/Admin users
  const fetchClientOrganizations = async () => {
    if (!session?.user) return

    setFetchingClients(true)
    try {
      const response = await fetch('/api/organizations/clients?limit=100')
      if (response.ok) {
        const data = await response.json()
        setClientOrganizations(data.organizations || [])
      }
    } catch (error) {
      console.error('Error fetching client organizations:', error)
    } finally {
      setFetchingClients(false)
    }
  }

  useEffect(() => {
    if (session?.user && (interfaceContext.isCreative || interfaceContext.isAdmin)) {
      fetchClientOrganizations()
    }
  }, [session?.user, interfaceContext.isCreative, interfaceContext.isAdmin])

  const handleClientSwitch = async (organization: ClientOrganization) => {
    setLoading(true)
    try {
      // Find the organization in user's organizations
      const userOrg = userOrganizations.find(org => org.id === organization.id)
      if (userOrg) {
        setCurrentOrganization(userOrg)
        setIsOpen(false)
        router.refresh()
      } else {
        // If not in user's organizations, navigate to admin view
        router.push(`/admin/organizations/${organization.id}`)
      }
    } catch (error) {
      console.error('Failed to switch to client:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleQuickAction = (action: string, organizationId: string) => {
    switch (action) {
      case 'ideas':
        router.push(`/ideas?org=${organizationId}`)
        break
      case 'content':
        router.push(`/content-review?org=${organizationId}`)
        break
      case 'delivery':
        router.push(`/delivery-plans?org=${organizationId}`)
        break
      case 'analytics':
        router.push(`/analytics?org=${organizationId}`)
        break
      default:
        break
    }
    setIsOpen(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'green'
      case 'TRIAL':
        return 'blue'
      case 'PAST_DUE':
        return 'yellow'
      case 'CANCELLED':
        return 'red'
      default:
        return 'gray'
    }
  }

  if (!session?.user) {
    return null
  }

  if (isLoading || fetchingClients) {
    return (
      <div className="flex items-center space-x-2">
        <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
        <span className="text-sm text-gray-500">Loading clients...</span>
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
          {currentOrganization?.name || 'Select Client'}
        </span>
        <ChevronDownIcon className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Client Organizations</h3>
            <p className="text-xs text-gray-500 mt-1">
              Switch between clients to manage their content
            </p>
          </div>
          
          <div className="py-2">
            {clientOrganizations.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <BuildingOfficeIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No client organizations found</p>
              </div>
            ) : (
              clientOrganizations.map((org) => (
                <div key={org.id} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                  {/* Organization Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ 
                          backgroundColor: org.primaryColor || '#3B82F6' 
                        }}
                      />
                      <span className="font-medium text-sm text-gray-900 truncate">
                        {org.name}
                      </span>
                      <Badge 
                        variant={getStatusColor(org.subscriptionStatus) as any} 
                        size="sm"
                      >
                        {org.subscriptionStatus}
                      </Badge>
                    </div>
                    {currentOrganization?.id === org.id && (
                      <CheckIcon className="h-4 w-4 text-blue-600" />
                    )}
                  </div>

                  {/* Organization Stats */}
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    <div className="text-center">
                      <div className="text-xs font-medium text-gray-900">{org.stats.ideas}</div>
                      <div className="text-xs text-gray-500">Ideas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-medium text-gray-900">{org.stats.contentDrafts}</div>
                      <div className="text-xs text-gray-500">Drafts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-medium text-gray-900">{org.stats.contentItems}</div>
                      <div className="text-xs text-gray-500">Content</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-medium text-gray-900">{org.userCount}</div>
                      <div className="text-xs text-gray-500">Users</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleClientSwitch(org)}
                      className={`text-xs px-2 py-1 rounded ${
                        currentOrganization?.id === org.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      disabled={loading}
                    >
                      Switch to Client
                    </button>
                    
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleQuickAction('ideas', org.id)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="View Ideas"
                      >
                        <LightBulbIcon className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleQuickAction('content', org.id)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Content Creation"
                      >
                        <EyeIcon className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleQuickAction('delivery', org.id)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Delivery Plans"
                      >
                        <CalendarIcon className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleQuickAction('analytics', org.id)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Analytics"
                      >
                        <ChartBarIcon className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Actions */}
          {interfaceContext.isAdmin && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  router.push('/admin/organizations')
                  setIsOpen(false)
                }}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center space-x-2"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Manage All Organizations</span>
                <ArrowTopRightOnSquareIcon className="h-3 w-3 ml-auto" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 