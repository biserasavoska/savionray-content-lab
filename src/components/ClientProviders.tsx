'use client'

import { SessionProvider } from 'next-auth/react'

import Navigation from './Navigation'

import { OrganizationProvider } from '@/lib/contexts/OrganizationContext'

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