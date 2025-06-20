'use client'

import IdeaForm from '../components/IdeaForm'

export default function NewIdeaPage() {
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