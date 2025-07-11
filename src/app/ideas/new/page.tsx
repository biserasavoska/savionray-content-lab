'use client'

import { useEffect } from 'react'
import IdeaForm from '../components/IdeaForm'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function NewIdeaPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (status === 'unauthenticated') {
    return <div className="min-h-screen flex items-center justify-center">Redirecting to sign in...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Create New Idea</h1>
        <div className="bg-white shadow rounded-lg p-6">
          <IdeaForm />
        </div>
      </div>
    </div>
  )
} 