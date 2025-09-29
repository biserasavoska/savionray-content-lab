'use client'

import OrganizationSwitcher from './navigation/OrganizationSwitcher'
import { useInterface } from '@/hooks/useInterface'
import { useOrganization } from '@/lib/contexts/OrganizationContext'

export default function DesktopTopNavigation() {
  const interfaceContext = useInterface()
  const { currentOrganization } = useOrganization()
  
  // Hide the entire top navigation bar for client users
  if (interfaceContext.isClient) {
    return null
  }
  
  // Determine if we should show the organization switcher
  const shouldShowOrganizationSwitcher = () => {
    // Only show for admin users
    if (!interfaceContext.isAdmin) {
      return false
    }
    
    // Hide when admin user is viewing as a client organization (not SavionRay)
    if (currentOrganization) {
      const isSavionRay = currentOrganization.name.toLowerCase().includes('savion') || 
                         currentOrganization.name.toLowerCase().includes('savionray') ||
                         currentOrganization.slug === 'savionray'
      
      // Only show if viewing SavionRay organization (admin's own organization)
      return isSavionRay
    }
    
    return false // Don't show by default for any user type
  }
  
  return (
    <div className="hidden lg:block sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left side - Logo/Brand */}
        <div className="flex items-center">
          <h1 className="text-lg font-semibold text-gray-900">
            Savion Ray Content Lab
          </h1>
        </div>
        
        {/* Right side - Organization Switcher for Admin users (only when viewing SavionRay) */}
        <div className="flex items-center">
          {shouldShowOrganizationSwitcher() && (
            <OrganizationSwitcher />
          )}
        </div>
      </div>
    </div>
  )
}
