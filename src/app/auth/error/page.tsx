'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

const getErrorMessage = (error: string | null) => {
  switch (error) {
    case 'Configuration':
      return 'There is a problem with the server configuration.'
    case 'AccessDenied':
      return 'You do not have permission to sign in.'
    case 'Verification':
      return 'The sign in link is no longer valid. It may have been used already or it may have expired.'
    default:
      return 'An error occurred during authentication.'
  }
}

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const errorMessage = getErrorMessage(error)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Authentication Error
          </h2>
          <div className="mt-2 text-center text-red-600">
            {errorMessage}
          </div>
        </div>
        <div className="text-center">
          <Link
            href="/auth/signin"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Try signing in again
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function ErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorContent />
    </Suspense>
  )
} 