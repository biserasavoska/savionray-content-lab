'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'

function SignInForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl,
      })

      if (result?.error) {
        setError('Invalid email or password')
      } else if (result?.url) {
        window.location.href = result.url
      }
    } catch (error) {
      console.error('Sign in error:', error)
      setError('An error occurred during sign in')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLinkedInSignIn = () => {
    signIn('linkedin', { callbackUrl })
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f7f6f3]">
      {/* Left: Login Form Card */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-10 flex flex-col items-center">
          <Image src="/logo.svg" alt="Savion Ray Logo" width={48} height={48} className="mb-6" style={{ height: 'auto' }} />
          <h2 className="text-2xl font-bold mb-2 text-gray-900 text-center">Log in to your account</h2>
          <p className="text-gray-500 mb-6 text-center">Enter your details to proceed further</p>
          {error && (
            <div className="mb-4 text-center text-red-600 bg-red-100 rounded p-2 w-full">{error}</div>
          )}
          <form className="space-y-4 w-full" onSubmit={handleSignIn}>
            <div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full rounded-full border border-red-400 px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 text-gray-900"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full rounded-full border border-red-400 px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 text-gray-900"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Log in'}
            </button>
            <button
              type="button"
              className="w-full rounded-full bg-red-100 text-red-600 font-semibold py-3 hover:bg-red-200 transition-colors"
              disabled
            >
              Reset password
            </button>
          </form>
          <button
            onClick={handleLinkedInSignIn}
            className="w-full mt-4 flex justify-center items-center rounded-full border border-gray-300 bg-white text-gray-700 font-semibold py-3 hover:bg-gray-100 transition-colors"
            disabled={isLoading}
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M15.547 1.5H4.453C2.842 1.5 1.5 2.842 1.5 4.453v11.094c0 1.611 1.342 2.953 2.953 2.953h11.094c1.611 0 2.953-1.342 2.953-2.953V4.453c0-1.611-1.342-2.953-2.953-2.953zM7.5 14.5h-2v-7h2v7zm-1-7.95c-.652 0-1.181-.529-1.181-1.181s.529-1.181 1.181-1.181 1.181.529 1.181 1.181S7.152 6.55 6.5 6.55zM15 14.5h-2v-3.5c0-2.206-2-2.049-2-2.049v-1.451h2c2.206 0 2 2.049 2 2.049V14.5z" />
            </svg>
            Sign in with LinkedIn
          </button>
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

export default function SignIn() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInForm />
    </Suspense>
  )
} 