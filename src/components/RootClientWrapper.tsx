'use client'

import { Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

import RoleBasedNavigation from './navigation/RoleBasedNavigation'
import TopNavigation from './TopNavigation'

import { OrganizationProvider } from '@/lib/contexts/OrganizationContext'

export default function RootClientWrapper({
  children,
  session,
}: {
  children: React.ReactNode
  session: Session | null
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Hide sidebar on auth pages
  const isAuthPage = pathname?.startsWith('/auth') || pathname?.startsWith('/signin') || pathname?.startsWith('/signout')

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <SessionProvider session={session}>
        <OrganizationProvider>
          <div className="min-h-screen bg-gray-50">
            {children}
          </div>
        </OrganizationProvider>
      </SessionProvider>
    )
  }

  return (
    <SessionProvider session={session}>
      <OrganizationProvider>
        <div className="min-h-screen bg-gray-50 flex flex-row">
          {/* Role-based Sidebar (hidden on auth pages) */}
          {!isAuthPage && (
            <RoleBasedNavigation isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
          )}
          {/* Main content area */}
          <div className="flex-1 flex flex-col min-h-screen">
            {/* Top navigation for mobile */}
            {!isAuthPage && <TopNavigation setIsSidebarOpen={setIsSidebarOpen} />}
            {/* Main page content */}
            <main className="flex-1">
              {children}
            </main>
          </div>
        </div>
      </OrganizationProvider>
    </SessionProvider>
  )
} 