'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import ClientDashboard from '@/components/dashboards/ClientDashboard'
import AgencyDashboard from '@/components/dashboards/AgencyDashboard'
import RoleBasedLayout from '@/components/layouts/RoleBasedLayout'
import { useInterface } from '@/hooks/useInterface'

export default function HomePage() {
  const { data: session, status } = useSession()
  const interfaceContext = useInterface()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h2>
          <p className="text-gray-600">You need to be signed in to access this page.</p>
        </div>
      </div>
    )
  }

  // Determine which dashboard to show based on role
  const isClient = interfaceContext.isClient
  const isAgency = interfaceContext.isAgency

  return (
    <RoleBasedLayout 
      allowedRoles={['CLIENT', 'CREATIVE', 'ADMIN']}
      layout={isClient ? 'client' : 'agency'}
    >
      {isClient ? <ClientDashboard /> : <AgencyDashboard />}
    </RoleBasedLayout>
  )
}
