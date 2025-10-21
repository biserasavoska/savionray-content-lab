import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

import { authOptions, isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import OrganizationTeamManagement from './OrganizationTeamManagement'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

export default async function OrganizationTeamPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  if (!isAdmin(session)) {
    redirect('/dashboard')
  }

  // Get the organization
  const organization = await prisma.organization.findUnique({
    where: { id: params.id },
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
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Team Management</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage team members for <strong>{organization.name}</strong>. Edit system roles and remove/delete team members.
          </p>
        </div>

        <div className="bg-white shadow rounded-lg">
          <OrganizationTeamManagement organizationId={organization.id} organizationName={organization.name} />
        </div>
      </div>
    </div>
  )
}
