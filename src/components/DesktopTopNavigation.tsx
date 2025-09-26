'use client'

import OrganizationSwitcher from './navigation/OrganizationSwitcher'
import { useInterface } from '@/hooks/useInterface'

export default function DesktopTopNavigation() {
  const interfaceContext = useInterface()
  
  return (
    <div className="hidden lg:block sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left side - Logo/Brand */}
        <div className="flex items-center">
          <h1 className="text-lg font-semibold text-gray-900">
            Savion Ray Content Lab
          </h1>
        </div>
        
        {/* Right side - Organization Switcher for Admin users */}
        <div className="flex items-center">
          {/* Organization Switcher for Admin users */}
          {interfaceContext.isAdmin && (
            <OrganizationSwitcher />
          )}
        </div>
      </div>
    </div>
  )
}
