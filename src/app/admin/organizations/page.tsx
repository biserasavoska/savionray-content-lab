import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

import OrganizationManagementList from './OrganizationManagementList'

import { authOptions , isAdmin } from '@/lib/auth'

export default async function AdminOrganizationsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  if (!isAdmin(session)) {
    redirect('/dashboard')
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Organization Management</h1>
              <p className="mt-2 text-sm text-gray-600">
                Manage all client organizations and their settings
              </p>
            </div>
            <a
              href="/admin/organizations/create"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Create Organization
            </a>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <OrganizationManagementList />
        </div>
      </div>
    </div>
  )
} 