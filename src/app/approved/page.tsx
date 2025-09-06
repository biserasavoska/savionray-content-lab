import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

import { authOptions, isAdmin, isCreative } from '@/lib/auth'
import ApprovedContentList from '@/components/approved-content/ApprovedContentList'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

export default async function ApprovedContentPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  const isAdminUser = isAdmin(session)
  const isCreativeUser = isCreative(session)
  const isClientUser = session.user.role === 'CLIENT'

  // All authenticated users can access approved content
  if (!isAdminUser && !isCreativeUser && !isClientUser) {
    redirect('/')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Approved Content
        </h1>
        <p className="text-gray-600">
          Content that has been approved by clients and is ready for publishing
        </p>
      </div>

      <ApprovedContentList 
        isAdminUser={isAdminUser}
        isCreativeUser={isCreativeUser}
        isClientUser={isClientUser}
      />
    </div>
  )
}