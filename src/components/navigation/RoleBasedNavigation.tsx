'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import Image from 'next/image'
import { 
  HomeIcon, 
  LightBulbIcon, 
  EyeIcon, 
  DocumentTextIcon, 
  CalendarIcon,
  UserIcon,
  CogIcon,
  ArrowLeftOnRectangleIcon,
  XMarkIcon,
  ChartBarIcon,
  FolderIcon,
  UsersIcon,
  BuildingOfficeIcon,
  CreditCardIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline'
import { useInterface } from '@/hooks/useInterface'

interface NavigationItem {
  name: string
  href: string
  icon: any
  roles: string[]
}

interface RoleBasedNavigationProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export default function RoleBasedNavigation({ isOpen, setIsOpen }: RoleBasedNavigationProps) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const interfaceContext = useInterface()

  // Define navigation items for different roles
  const navigationItems: NavigationItem[] = [
    // Common items
    { name: 'Dashboard', href: '/', icon: HomeIcon, roles: ['CLIENT', 'CREATIVE', 'ADMIN'] },
    
    // Client-specific items
    { name: 'Content Review', href: '/content-review', icon: EyeIcon, roles: ['CLIENT'] },
    { name: 'Approved Content', href: '/approved', icon: DocumentTextIcon, roles: ['CLIENT'] },
    
    // Creative/Agency items
    { name: 'Ideas', href: '/ideas', icon: LightBulbIcon, roles: ['CREATIVE', 'ADMIN'] },
    { name: 'Content Review', href: '/content-review', icon: EyeIcon, roles: ['CREATIVE', 'ADMIN'] },
    { name: 'Ready Content', href: '/ready-content', icon: DocumentTextIcon, roles: ['CREATIVE', 'ADMIN'] },
    { name: 'Published', href: '/published', icon: FolderIcon, roles: ['CREATIVE', 'ADMIN'] },
    { name: 'Scheduled Posts', href: '/scheduled-posts', icon: CalendarIcon, roles: ['CREATIVE', 'ADMIN'] },
    { name: 'Delivery Plans', href: '/delivery-plans', icon: ChartBarIcon, roles: ['CREATIVE', 'ADMIN'] },
    
    // Admin-only items
    { name: 'Organizations', href: '/admin/organizations', icon: BuildingOfficeIcon, roles: ['ADMIN'] },
    { name: 'Team', href: '/team', icon: UsersIcon, roles: ['ADMIN'] },
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon, roles: ['ADMIN'] },
    { name: 'Billing', href: '/billing', icon: CreditCardIcon, roles: ['ADMIN'] },
  ]

  // Filter navigation items based on user role
  const filteredNavigation = navigationItems.filter(item => 
    item.roles.includes(interfaceContext.userRole)
  )

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(path)
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.svg"
                alt="Savion Ray"
                width={120}
                height={32}
                className="h-8 w-auto"
              />
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {filteredNavigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200
                    ${isActive(item.href)
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          {session && (
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-700">
                    {session.user.name?.[0] || session.user.email?.[0] || '?'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {session.user.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {session.user.email}
                  </p>
                  <p className="text-xs text-blue-600 font-medium">
                    {interfaceContext.userRole}
                  </p>
                </div>
              </div>
              
              <div className="space-y-1">
                <Link
                  href="/profile"
                  className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors duration-200"
                >
                  <UserIcon className="mr-3 h-4 w-4" />
                  Profile
                </Link>
                
                {/* Show organization settings for admins */}
                {interfaceContext.isAdmin && (
                  <>
                    <Link
                      href="/organization/settings"
                      className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors duration-200"
                    >
                      <CogIcon className="mr-3 h-4 w-4" />
                      Organization
                    </Link>
                    <Link
                      href="/organization/settings/invitations"
                      className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors duration-200"
                    >
                      <EnvelopeIcon className="mr-3 h-4 w-4" />
                      Invitations
                    </Link>
                  </>
                )}
                
                <button
                  onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors duration-200"
                >
                  <ArrowLeftOnRectangleIcon className="mr-3 h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
} 