import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

import InvitationManagementList from './InvitationManagementList'
import InviteUserForm from './InviteUserForm'

import { authOptions , isAdmin } from '@/lib/auth'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

export default async function OrganizationInvitationsPage() {
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
          <h1 className="text-3xl font-bold text-gray-900">Team Invitations</h1>
          <p className="mt-2 text-sm text-gray-600">
            Invite team members to your organization and manage pending invitations
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Invite New Member
            </h2>
            <InviteUserForm />
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Pending Invitations
            </h2>
            <InvitationManagementList />
          </div>
        </div>
      </div>
    </div>
  )
} 