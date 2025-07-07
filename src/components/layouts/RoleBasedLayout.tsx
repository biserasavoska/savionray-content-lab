'use client'

import { useSession } from 'next-auth/react'
import { ReactNode } from 'react'

interface RoleBasedLayoutProps {
  children: ReactNode
  allowedRoles: string[]
  fallback?: ReactNode
  layout?: 'default' | 'client' | 'agency'
}

export default function RoleBasedLayout({ 
  children, 
  allowedRoles, 
  fallback,
  layout = 'default'
}: RoleBasedLayoutProps) {
  const { data: session, status } = useSession()

  // Show loading while session is loading
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Show fallback if no session
  if (!session) {
    return fallback || (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">Please sign in to access this page.</p>
        </div>
      </div>
    )
  }

  // Check if user has required role
  const hasAccess = allowedRoles.includes(session.user.role)

  if (!hasAccess) {
    return fallback || (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">
            You don't have permission to access this page.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Required role: {allowedRoles.join(' or ')}
          </p>
        </div>
      </div>
    )
  }

  // Apply role-specific layout classes
  const layoutClasses = {
    default: 'min-h-screen bg-gray-50',
    client: 'min-h-screen bg-gray-50 client-layout',
    agency: 'min-h-screen bg-gray-50 agency-layout'
  }

  return (
    <div className={layoutClasses[layout]}>
      {children}
    </div>
  )
} 