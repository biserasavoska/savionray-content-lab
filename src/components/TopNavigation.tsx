'use client'

import { Bars3Icon } from '@heroicons/react/24/outline'

interface TopNavigationProps {
  setIsSidebarOpen: (open: boolean) => void
}

export default function TopNavigation({ setIsSidebarOpen }: TopNavigationProps) {
  return (
    <div className="sticky top-0 z-30 bg-white border-b border-gray-200 lg:hidden">
      <div className="flex items-center justify-between h-16 px-4">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
        
        <div className="flex-1 flex justify-center">
          <h1 className="text-lg font-semibold text-gray-900">
            Savion Ray Content Lab
          </h1>
        </div>
        
        <div className="w-10" /> {/* Spacer for centering */}
      </div>
    </div>
  )
} 