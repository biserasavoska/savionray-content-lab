'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    // Check for URL parameters
    const urlError = searchParams.get('error')
    const urlSuccess = searchParams.get('success')

    if (urlError === 'linkedin_connection_failed') {
      setError('Failed to connect LinkedIn account. Please try again.')
    } else if (urlError === 'invalid_callback') {
      setError('Invalid callback from LinkedIn. Please try again.')
    }

    if (urlSuccess === 'linkedin_connected') {
      setSuccess('LinkedIn account connected successfully!')
      setIsConnected(true)
    }

    // Check if user has LinkedIn connected
    const checkLinkedInConnection = async () => {
      try {
        const response = await fetch('/api/auth/linkedin/status')
        const data = await response.json()
        setIsConnected(data.isConnected)
      } catch (error) {
        console.error('Error checking LinkedIn connection:', error)
      }
    }

    if (session?.user?.id) {
      checkLinkedInConnection()
    }
  }, [session, searchParams])

  // Show loading state while checking session
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Redirect if not authenticated
  if (status === 'unauthenticated') {
    router.replace('/auth/signin')
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Redirecting to sign in...</div>
      </div>
    )
  }

  const handleConnectLinkedIn = async () => {
    setIsConnecting(true)
    setError('')
    try {
      const response = await fetch('/api/auth/linkedin/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID,
          redirectUri: `${window.location.origin}/api/auth/linkedin/callback`,
          scope: 'r_liteprofile w_member_social',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to initiate LinkedIn connection')
      }

      const { authUrl } = await response.json()
      window.location.href = authUrl
    } catch (error) {
      console.error('Error connecting LinkedIn:', error)
      setError('Failed to initiate LinkedIn connection. Please try again.')
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnectLinkedIn = async () => {
    try {
      const response = await fetch('/api/auth/linkedin/disconnect', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to disconnect LinkedIn account')
      }

      setIsConnected(false)
      setSuccess('LinkedIn account disconnected successfully!')
    } catch (error) {
      console.error('Error disconnecting LinkedIn:', error)
      setError('Failed to disconnect LinkedIn account. Please try again.')
    }
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile Settings</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Account Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <p className="mt-1 text-sm text-gray-900">{session?.user?.name || 'Not set'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{session?.user?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <p className="mt-1 text-sm text-gray-900">{session?.user?.role}</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Connected Accounts</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <svg className="w-8 h-8 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                  </svg>
                  <div>
                    <h3 className="font-medium">LinkedIn</h3>
                    <p className="text-sm text-gray-500">
                      {isConnected
                        ? 'Your LinkedIn account is connected'
                        : 'Connect your LinkedIn profile for posting'}
                    </p>
                  </div>
                </div>
                {isConnected ? (
                  <button
                    onClick={handleDisconnectLinkedIn}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={handleConnectLinkedIn}
                    disabled={isConnecting}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#0A66C2] hover:bg-[#004182] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0A66C2] disabled:opacity-50"
                  >
                    {isConnecting ? 'Connecting...' : 'Connect LinkedIn'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 