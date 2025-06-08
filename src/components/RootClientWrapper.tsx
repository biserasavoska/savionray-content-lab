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
    <SessionProvider session={session} refetchInterval={0} refetchOnWindowFocus={false}>
      <Navigation />
      {children}
    </SessionProvider>
  )
} 