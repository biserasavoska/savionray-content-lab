'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'

export default function HomePage() {
  const { data: session } = useSession()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12 flex flex-col md:flex-row items-center min-h-[70vh]">
      {/* Left: Welcome Content */}
      <div className="flex-1 flex flex-col justify-center items-start">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-10 flex flex-col items-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 text-center">
            Welcome to Savion Ray Content Lab
          </h1>
          {session ? (
            <>
              <p className="text-lg text-gray-700 mb-6 text-center">
                Hello, {session.user.name || session.user.email}! Get started by:
              </p>
              <div className="flex flex-col md:flex-row gap-4 w-full justify-center">
                <Link
                  href="/ideas"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-500 hover:bg-red-600 justify-center w-full md:w-auto text-center"
                >
                  View Content Ideas
                </Link>
                <Link
                  href="/content-review"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-500 hover:bg-red-600 justify-center w-full md:w-auto text-center"
                >
                  Review Approvals
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className="text-lg text-gray-600 text-center mb-4">
                Please sign in to access the content management system.
              </p>
              <Link
                href="/auth/signin"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-500 hover:bg-red-600 justify-center w-full"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>
      {/* Right: Hero Image */}
      <div className="hidden md:flex flex-1 items-center justify-center">
        <Image
          src="/ai-hero.png"
          alt="AI Hero"
          width={500}
          height={500}
          className="object-contain"
          priority
        />
      </div>
    </div>
  )
}
