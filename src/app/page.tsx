'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'

export default function HomePage() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f7f6f3]">
      {/* Left: Welcome Content */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-10 flex flex-col items-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
            Welcome to Savion Ray Content Lab
          </h1>
          {session ? (
            <div className="space-y-4 w-full">
              <p className="text-lg text-gray-600 text-center">
                Hello, {session.user?.name || session.user?.email}! Get started by:
              </p>
              <div className="flex flex-col md:flex-row gap-4 justify-center">
                <Link
                  href="/ideas"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-500 hover:bg-red-600 justify-center"
                >
                  View Content Ideas
                </Link>
                <Link
                  href="/approvals"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-500 hover:bg-red-600 justify-center"
                >
                  Review Approvals
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4 w-full">
              <p className="text-lg text-gray-600 text-center">
                Please sign in to access the content management system.
              </p>
              <Link
                href="/auth/signin"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-500 hover:bg-red-600 justify-center w-full"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
      {/* Right: Hero Image */}
      <div className="hidden md:flex flex-1 items-center justify-center bg-[#f7f6f3]">
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
