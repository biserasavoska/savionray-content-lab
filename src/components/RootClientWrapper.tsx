'use client'

import { Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import { useState } from 'react'
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

  return (
    <SessionProvider session={session}>
      <div className="min-h-screen bg-gray-50">
        {/* Mobile top navigation */}
        <TopNavigation setIsSidebarOpen={setIsSidebarOpen} />
        
        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        
        {/* Main content */}
        <div className="lg:pl-64">
          <main className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SessionProvider>
  )
} 