'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
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

  // Fetch user's organizations
  const fetchOrganizations = async () => {
    if (!session?.user) return

    try {
      const response = await fetch('/api/organization/list')
      if (response.ok) {
        const data = await response.json()
        setUserOrganizations(data.organizations || [])
        
        // If no current organization is set, use the first one
        if (!currentOrganization && data.organizations?.length > 0) {
          setCurrentOrganization(data.organizations[0])
        }
      }
    } catch (error) {
      console.error('Error fetching organizations:', error)
    }
  }

  // Switch to a different organization
  const switchOrganization = async (organizationId: string) => {
    const organization = userOrganizations.find(org => org.id === organizationId)
    if (organization) {
      setCurrentOrganization(organization)
      
      // Store the selected organization in localStorage for persistence
      localStorage.setItem('selectedOrganizationId', organizationId)
      
      // Set a cookie for server-side organization context
      document.cookie = `selectedOrganizationId=${organizationId}; path=/; max-age=86400; SameSite=Lax`
      
      // Update the URL to reflect the organization context
      const currentPath = window.location.pathname
      if (currentPath.startsWith('/organization/')) {
        // If we're already in an organization context, update the URL
        const newPath = currentPath.replace(/^\/organization\/[^/]+/, `/organization/${organization.slug}`)
        window.history.pushState({}, '', newPath)
      }
      
      // Refresh the page to update all context-dependent components
      window.location.reload()
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
      fetchOrganizations()
    } else {
      setCurrentOrganization(null)
      setUserOrganizations([])
    }
    setIsLoading(false)
  }, [session, status])

  // Restore selected organization from localStorage
  useEffect(() => {
    if (userOrganizations.length > 0) {
      const savedOrganizationId = localStorage.getItem('selectedOrganizationId')
      if (savedOrganizationId) {
        const savedOrganization = userOrganizations.find(org => org.id === savedOrganizationId)
        if (savedOrganization) {
          setCurrentOrganization(savedOrganization)
        }
      }
    }
  }, [userOrganizations])

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