import { useOrganization } from '@/lib/contexts/OrganizationContext'

export function useCurrentOrganization() {
  const { currentOrganization, isLoading } = useOrganization()
  
  return {
    organizationId: currentOrganization?.id || null,
    organization: currentOrganization,
    isLoading
  }
} 