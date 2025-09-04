import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

import OrganizationSettingsForm from './OrganizationSettingsForm'

import { authOptions , isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requireOrganizationContext } from '@/lib/utils/organization-context'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

export default async function OrganizationSettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  if (!isAdmin(session)) {
    redirect('/dashboard')
  }

  const orgContext = await requireOrganizationContext()
  if (!orgContext) {
    redirect('/auth/signin')
  }

  const organization = await prisma.organization.findUnique({
    where: { id: orgContext.organizationId },
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
    redirect('/dashboard')
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Organization Settings</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your organization details and settings
          </p>
        </div>

        <div className="bg-white shadow rounded-lg">
          <OrganizationSettingsForm organization={organization} />
        </div>
      </div>
    </div>
  )
} 