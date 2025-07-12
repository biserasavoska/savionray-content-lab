import { useOrganization } from '@/lib/contexts/OrganizationContext'

/**
 * Create headers with organization context for API calls
 */
export function createApiHeaders(additionalHeaders?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...additionalHeaders
  }
  
  return headers
}

/**
 * Hook to get API headers with organization context
 */
export function useApiHeaders(additionalHeaders?: Record<string, string>) {
  const { currentOrganization } = useOrganization()
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...additionalHeaders
  }
  
  // Add organization ID to headers if available
  if (currentOrganization?.id) {
    headers['x-organization-id'] = currentOrganization.id
  }
  
  return headers
}

/**
 * Make an API call with organization context
 */
export async function apiCall(
  url: string, 
  options: RequestInit = {}, 
  organizationId?: string
): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>
  }
  
  // Add organization ID to headers if provided
  if (organizationId) {
    headers['x-organization-id'] = organizationId
  }
  
  return fetch(url, {
    ...options,
    headers
  })
} 