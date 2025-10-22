'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function CreateContentPage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    // Redirect to the appropriate content creation route based on user role
    const userRole = session.user?.role

    if (userRole === 'CREATIVE' || userRole === 'ADMIN') {
      // For creative users and admins, redirect to the unified content system
      router.push('/content-review/unified')
    } else if (userRole === 'CLIENT') {
      // For client users, redirect to ideas to review
      router.push('/ideas')
    } else {
      // Default fallback to ideas
      router.push('/ideas')
    }
  }, [session, status, router])

  // Show loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to content creation...</p>
      </div>
    </div>
  )
}
