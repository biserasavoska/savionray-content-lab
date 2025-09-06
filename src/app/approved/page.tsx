'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { isAdmin, isCreative } from '@/lib/auth'
import ApprovedContentList from '@/components/approved-content/ApprovedContentList'

export default function ApprovedContentPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // Still loading

    if (!session) {
      router.push('/auth/signin')
      return
    }

    const isAdminUser = isAdmin(session)
    const isCreativeUser = isCreative(session)
    const isClientUser = session.user.role === 'CLIENT'

    // All authenticated users can access approved content
    if (!isAdminUser && !isCreativeUser && !isClientUser) {
      router.push('/')
      return
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    )
  }

  if (!session) {
    return null // Will redirect
  }

  const isAdminUser = isAdmin(session)
  const isCreativeUser = isCreative(session)
  const isClientUser = session.user.role === 'CLIENT'

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Approved
        </h1>
        <p className="text-gray-600">
          Content that has been approved by clients and is ready for publishing
        </p>
      </div>

      <ApprovedContentList 
        isAdminUser={isAdminUser}
        isCreativeUser={isCreativeUser}
        isClientUser={isClientUser}
      />
    </div>
  )
}