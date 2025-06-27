'use client'

import { Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import TopNavigation from './TopNavigation'

export default function RootClientWrapper({
  children,
  session,
}: {
  children: React.ReactNode
  session: Session | null
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()

  // Hide sidebar on auth pages
  const isAuthPage = pathname?.startsWith('/auth') || pathname?.startsWith('/signin') || pathname?.startsWith('/signout')

  return (
    <SessionProvider session={session}>
      <div className="min-h-screen bg-gray-50 flex flex-row">
        {/* Sidebar (hidden on auth pages) */}
        {!isAuthPage && (
          <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
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
    </SessionProvider>
  )
} 