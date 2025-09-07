import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

import { authOptions, isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requireOrganizationContext } from '@/lib/utils/organization-context'
import UserManagementList from '@/app/organization/users/UserManagementList'

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
    include: {
      OrganizationUser: {
        where: { isActive: true },
        include: {
          User_OrganizationUser_userIdToUser: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              image: true,
            }
          }
        },
        orderBy: { joinedAt: 'desc' }
      }
    }
  })

  if (!organization) {
    redirect('/admin/organizations')
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage team members for <strong>{organization.name}</strong>. Edit system roles and remove/delete team members.
          </p>
        </div>

        <div className="bg-white shadow rounded-lg">
          <UserManagementList organization={organization} />
        </div>
      </div>
    </div>
  )
}
