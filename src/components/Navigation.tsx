'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { isAdmin, isClient, isCreative } from '@/lib/auth'
import Image from 'next/image'

export default function Navigation() {
  const { data: session } = useSession()
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname.startsWith(path) ? 'border-red-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-900'
  }

  return (
    <div className="bg-gray-50">
      {/* Top Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <Image
                  src="/logo.svg"
                  alt="Savion Ray"
                  width={120}
                  height={32}
                  className="h-8 w-auto"
                />
              </Link>
            </div>

            {/* Right side navigation items */}
            <div className="flex items-center space-x-4">
              {/* Language Toggle */}
              <button className="p-2 text-gray-400 hover:text-gray-500">
                <span className="sr-only">Toggle language</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
              </button>

              {/* User Profile */}
              {session ? (
                <div className="relative group">
                  <button className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100">
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {session.user.name?.[0] || session.user.email?.[0] || '?'}
                      </span>
                    </div>
                    <div className="text-sm text-left">
                      <p className="font-medium text-gray-700">{session.user.name || 'User'}</p>
                      <p className="text-xs text-gray-500">{session.user.email}</p>
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 w-48 mt-2 py-2 bg-white rounded-lg shadow-lg invisible group-hover:visible hover:visible transition-all duration-150 z-50">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profile Settings
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  href="/auth/signin"
                  className="text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      {session && (
        <div className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="-mb-px flex space-x-8">
              <Link
                href="/ideas"
                className={`border-b-2 py-4 px-1 text-sm font-medium ${isActive('/ideas')}`}
              >
                Ideas
              </Link>
              <Link
                href="/content-review"
                className={`border-b-2 py-4 px-1 text-sm font-medium ${isActive('/content-review')}`}
              >
                Content Review
              </Link>
              <Link
                href="/published"
                className={`border-b-2 py-4 px-1 text-sm font-medium ${isActive('/published')}`}
              >
                Published
              </Link>
            </nav>
          </div>
        </div>
      )}
    </div>
  )
} 