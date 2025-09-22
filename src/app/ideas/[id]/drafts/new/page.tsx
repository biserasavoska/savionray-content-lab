'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function CreateDraftPage() {
  const params = useParams()
  const router = useRouter()

  useEffect(() => {
    // Redirect to the new ready-content edit page
    if (params.id) {
      router.replace(`/ready-content/${params.id}/edit`)
    }
  }, [params.id, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to the new draft editor...</p>
      </div>
    </div>
  )
}