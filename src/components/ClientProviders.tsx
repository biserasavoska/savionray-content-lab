'use client'

import { SessionProvider } from 'next-auth/react'
import Navigation from './Navigation'

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <Navigation />
      {children}
    </SessionProvider>
  )
} 