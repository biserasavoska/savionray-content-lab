'use client'

import { Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import Navigation from './Navigation'

export default function RootClientWrapper({
  children,
  session,
}: {
  children: React.ReactNode
  session: Session | null
}) {
  return (
    <SessionProvider session={session}>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </SessionProvider>
  )
} 