import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

import CreateOrganizationForm from './CreateOrganizationForm'

import { authOptions , isAdmin } from '@/lib/auth'

export default async function CreateOrganizationPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  if (!isAdmin(session)) {
    redirect('/dashboard')
  }

  return (
    <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <a
              href="/admin/organizations"
              className="text-blue-600 hover:text-blue-500"
            >
              ← Back to Organizations
            </a>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Create New Organization</h1>
          <p className="mt-2 text-sm text-gray-600">
            Create a new client organization and set up their team
          </p>
        </div>

        <div className="bg-white shadow rounded-lg">
          <CreateOrganizationForm />
        </div>
      </div>
    </div>
  )
} 