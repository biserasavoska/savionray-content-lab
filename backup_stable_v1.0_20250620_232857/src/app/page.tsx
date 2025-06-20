'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'

export default function HomePage() {
  const { data: session } = useSession()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">
        Welcome to Savion Ray Content Lab
      </h1>
      
      {session ? (
        <div className="space-y-4">
          <p className="text-lg text-gray-600">
            Hello, {session.user?.name || session.user?.email}! Get started by:
          </p>
          <div className="flex space-x-4">
            <Link
              href="/ideas"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-500 hover:bg-red-600"
            >
              View Content Ideas
            </Link>
            <Link
              href="/approvals"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-500 hover:bg-red-600"
            >
              Review Approvals
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-lg text-gray-600">
            Please sign in to access the content management system.
          </p>
          <Link
            href="/auth/signin"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-500 hover:bg-red-600"
          >
            Sign In
          </Link>
        </div>
      )}
    </div>
  )
}
