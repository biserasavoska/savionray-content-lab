'use client'

import { useSession } from 'next-auth/react'
import { useMemo } from 'react'

export interface InterfaceContext {
  isClient: boolean
  isAgency: boolean
  isCreative: boolean
  isAdmin: boolean
  canCreateContent: boolean
  canApproveContent: boolean
  canManageTeam: boolean
  canViewAnalytics: boolean
  canManageBilling: boolean
  userRole: string
  organizationType: 'CLIENT' | 'AGENCY' | null
}

export function useInterface(): InterfaceContext {
  const { data: session } = useSession()

  return useMemo(() => {
    if (!session?.user) {
      return {
        isClient: false,
        isAgency: false,
        isCreative: false,
        isAdmin: false,
        canCreateContent: false,
        canApproveContent: false,
        canManageTeam: false,
        canViewAnalytics: false,
        canManageBilling: false,
        userRole: '',
        organizationType: null
      }
    }

    const { role } = session.user

    // Determine organization type based on role
    // In a real implementation, this would come from organization context
    const organizationType = role === 'CLIENT' ? 'CLIENT' : 'AGENCY'

    return {
      isClient: role === 'CLIENT',
      isAgency: role === 'ADMIN' || role === 'CREATIVE',
      isCreative: role === 'CREATIVE',
      isAdmin: role === 'ADMIN',
      canCreateContent: ['CREATIVE', 'ADMIN'].includes(role),
      canApproveContent: ['CLIENT', 'ADMIN'].includes(role),
      canManageTeam: role === 'ADMIN',
      canViewAnalytics: ['CREATIVE', 'ADMIN'].includes(role),
      canManageBilling: role === 'ADMIN',
      userRole: role,
      organizationType
    }
  }, [session?.user])
}

// Feature flag hook for granular access control
export function useFeatureAccess(feature: string): boolean {
  const interfaceContext = useInterface()

  const featureFlags = {
    'content-creation': interfaceContext.canCreateContent,
    'content-approval': interfaceContext.canApproveContent,
    'team-management': interfaceContext.canManageTeam,
    'analytics': interfaceContext.canViewAnalytics,
    'billing': interfaceContext.canManageBilling,
    'client-dashboard': interfaceContext.isClient,
    'agency-dashboard': interfaceContext.isAgency
  }

  return featureFlags[feature as keyof typeof featureFlags] || false
} 