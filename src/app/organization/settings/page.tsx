'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

import OrganizationSettingsForm from './OrganizationSettingsForm'

import { isAdmin } from '@/lib/auth'
import { useOrganization } from '@/lib/contexts/OrganizationContext'

export default function OrganizationSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { currentOrganization, isLoading: orgLoading } = useOrganization()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading' || orgLoading) return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (!isAdmin(session)) {
      router.push('/dashboard')
      return
    }

    if (!currentOrganization) {
      router.push('/admin/organizations')
      return
    }

    setIsLoading(false)
  }, [session, status, currentOrganization, orgLoading, router])

  if (status === 'loading' || orgLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session || !isAdmin(session)) {
    return null
  }

  if (!currentOrganization) {
    return null
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Organization Settings</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your organization details and settings for <strong>{currentOrganization.name}</strong>
          </p>
        </div>

        <div className="bg-white shadow rounded-lg">
          <OrganizationSettingsForm organizationId={currentOrganization.id} organizationName={currentOrganization.name} />
        </div>
      </div>
    </div>
  )
} 