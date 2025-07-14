import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

import { authOptions , isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ClientUserManagement from '@/components/admin/ClientUserManagement'

interface UserManagementPageProps {
  params: { id: string }
}

export default async function UserManagementPage({ params }: UserManagementPageProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  if (!isAdmin(session)) {
    redirect('/dashboard')
  }

  const organizationId = params.id

  // Get organization details
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      id: true,
      name: true,
      slug: true
    }
  })

  if (!organization) {
    redirect('/admin/organizations')
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
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
          <h1 className="text-3xl font-bold text-gray-900 mt-4">User Management</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage users for {organization.name} (@{organization.slug})
          </p>
        </div>

        <div className="bg-white shadow rounded-lg">
          <ClientUserManagement 
            organizationId={organization.id}
            organizationName={organization.name}
          />
        </div>
      </div>
    </div>
  )
} 