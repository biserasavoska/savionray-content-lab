'use client'

import React from 'react'
import { useSession } from 'next-auth/react'
import LongFormContentPlanner from '@/components/content/LongFormContentPlanner'

export default function TestLongFormPage() {
  const { data: session } = useSession()

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h2>
          <p className="text-gray-600">You need to be signed in to test the Long-Form Content Planner.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <LongFormContentPlanner />
    </div>
  )
}
