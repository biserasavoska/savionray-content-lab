'use client'

import { SessionProvider } from 'next-auth/react'
import { OrganizationProvider } from '@/lib/contexts/OrganizationContext'
import Navigation from './Navigation'

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <OrganizationProvider>
        <Navigation />
        {children}
      </OrganizationProvider>
    </SessionProvider>
  )
} 