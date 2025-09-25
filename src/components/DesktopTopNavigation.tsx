'use client'

import ClientNavigationSwitcher from './navigation/ClientNavigationSwitcher'
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
        
        {/* Right side - Client Navigation Switcher for Creative and Admin users */}
        <div className="flex items-center">
          {(interfaceContext.isCreative || interfaceContext.isAdmin) && (
            <ClientNavigationSwitcher />
          )}
        </div>
      </div>
    </div>
  )
}
