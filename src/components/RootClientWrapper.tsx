'use client'

import { Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

import RoleBasedNavigation from './navigation/RoleBasedNavigation'
import TopNavigation from './TopNavigation'
import LogRocketProvider from './LogRocketProvider'

import { OrganizationProvider } from '@/lib/contexts/OrganizationContext'
import { initializeThemeDetection } from '@/lib/utils/theme-detection'

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
    
    // Initialize theme detection to handle special browser/OS environments
    const cleanup = initializeThemeDetection()
    
    // Cleanup on unmount
    return cleanup
  }, [])

  // Hide sidebar on auth pages
  const isAuthPage = pathname?.startsWith('/auth') || pathname?.startsWith('/signin') || pathname?.startsWith('/signout')

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <SessionProvider session={session}>
        <OrganizationProvider>
          <LogRocketProvider>
            <div className="min-h-screen bg-bg text-fg">
              {children}
            </div>
          </LogRocketProvider>
        </OrganizationProvider>
      </SessionProvider>
    )
  }

  return (
    <SessionProvider session={session}>
      <OrganizationProvider>
        <LogRocketProvider>
          <div className="min-h-screen bg-bg text-fg flex flex-row">
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
        </LogRocketProvider>
      </OrganizationProvider>
    </SessionProvider>
  )
} 