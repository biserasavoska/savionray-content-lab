'use client'

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react'
import { useSession } from 'next-auth/react'

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

interface OrganizationContextType {
  currentOrganization: Organization | null
  userOrganizations: Organization[]
  isLoading: boolean
  switchOrganization: (organizationId: string) => Promise<void>
  setCurrentOrganization: (organization: Organization | null) => void
  refreshOrganizations: () => Promise<void>
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined)

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null)
  const [userOrganizations, setUserOrganizations] = useState<Organization[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Create a stable reference for user role to prevent useEffect dependency array size changes
  const userRole = useMemo(() => session?.user?.role, [session?.user?.role])

  // Fetch user's organizations
  const fetchOrganizations = async () => {
    if (!session?.user) {
      console.log('No session user, skipping organization fetch')
      return
    }

    try {
      console.log('Fetching organizations for user:', session.user.email)
      const response = await fetch('/api/organization/list')
      if (response.ok) {
        const data = await response.json()
        console.log('Received organizations data:', data)
        setUserOrganizations(data.organizations || [])
        
        // Don't automatically set organization here - let the useEffect handle it
        // This prevents overriding the user's current selection
      } else {
        console.error('Failed to fetch organizations:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error fetching organizations:', error)
    }
  }

  // Switch to a different organization
  const switchOrganization = async (organizationId: string) => {
    console.log('🔄 Switching to organization:', organizationId)
    const organization = userOrganizations.find(org => org.id === organizationId)
    if (organization) {
      console.log('✅ Found organization:', organization.name)
      setCurrentOrganization(organization)
      
      // Store the selected organization in localStorage for persistence
      localStorage.setItem('selectedOrganizationId', organizationId)
      console.log('💾 Saved to localStorage:', organizationId)
      
      // Set a cookie for server-side organization context
      document.cookie = `selectedOrganizationId=${organizationId}; path=/; max-age=86400; SameSite=Lax`
      console.log('🍪 Set cookie:', organizationId)
      
      // Update the URL to reflect the organization context
      const currentPath = window.location.pathname
      if (currentPath.startsWith('/organization/')) {
        // If we're already in an organization context, update the URL
        const newPath = currentPath.replace(/^\/organization\/[^/]+/, `/organization/${organization.slug}`)
        window.history.pushState({}, '', newPath)
      }
      
      // Use router.refresh() instead of window.location.reload() for better UX
      // This will refresh the page data without a full reload
      if (typeof window !== 'undefined') {
        // Trigger a custom event that components can listen to
        window.dispatchEvent(new CustomEvent('organizationChanged', { 
          detail: { organizationId: organizationId } 
        }))
        console.log('📡 Dispatched organizationChanged event')
      }
    } else {
      console.error('❌ Organization not found:', organizationId)
    }
  }

  // Refresh organizations list
  const refreshOrganizations = async () => {
    await fetchOrganizations()
  }

  // Initialize organization context
  useEffect(() => {
    if (status === 'loading') return

    if (session?.user) {
      console.log('Session user found, fetching organizations')
      fetchOrganizations()
    } else {
      console.log('No session user, clearing organizations')
      setCurrentOrganization(null)
      setUserOrganizations([])
    }
    setIsLoading(false)
  }, [session, status])

  // Restore selected organization from localStorage
  useEffect(() => {
    if (userOrganizations.length > 0 && !currentOrganization) {
      const savedOrganizationId = localStorage.getItem('selectedOrganizationId')
      console.log('Organization context: userOrganizations loaded:', userOrganizations.map(o => o.name))
      console.log('Organization context: savedOrganizationId from localStorage:', savedOrganizationId)
      
      if (savedOrganizationId) {
        const savedOrganization = userOrganizations.find(org => org.id === savedOrganizationId)
        if (savedOrganization) {
          // Always respect the user's saved organization selection
          console.log('✅ Restoring saved organization:', savedOrganization.name)
          setCurrentOrganization(savedOrganization)
        } else {
          // If saved org not found, check if user is admin
          if (session?.user?.role === 'ADMIN') {
            console.log('⚠️ Admin user: saved org not found, NOT setting default organization')
            // Don't set any organization for admin users if saved org not found
          } else {
            console.log('📝 Non-admin user: saved org not found, using first available:', userOrganizations[0].name)
            setCurrentOrganization(userOrganizations[0])
          }
        }
      } else {
        // No saved organization - set the first available one for all users
        if (userOrganizations.length > 0) {
          console.log('📝 No saved org, using first available:', userOrganizations[0].name)
          setCurrentOrganization(userOrganizations[0])
          // Save this as the default selection
          localStorage.setItem('selectedOrganizationId', userOrganizations[0].id)
        } else {
          console.log('⚠️ No organizations available for user')
        }
      }
    }
  }, [userOrganizations, userRole, currentOrganization, session?.user?.role])

  const value: OrganizationContextType = {
    currentOrganization,
    userOrganizations,
    isLoading,
    switchOrganization,
    setCurrentOrganization,
    refreshOrganizations
  }

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  )
}

export function useOrganization() {
  const context = useContext(OrganizationContext)
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider')
  }
  return context
} 