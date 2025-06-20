'use client'

import IdeaForm from './components/IdeaForm'
import { useRouter } from 'next/navigation'

export default function NewIdeaSection() {
  const router = useRouter()

  const handleSuccess = () => {
    router.refresh()
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">New Idea</h2>
        <p className="mt-1 text-sm text-gray-600">
          Submit a new content idea for review
        </p>
      </div>
      <div className="p-4">
        <IdeaForm onSuccess={handleSuccess} />
      </div>
    </div>
  )
} 