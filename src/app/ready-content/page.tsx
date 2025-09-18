import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

import { authOptions, isClient, isCreative } from '@/lib/auth'
import ReadyContentList from '@/components/ready-content/ReadyContentList'

export const metadata: Metadata = {
  title: 'Drafts',
  description: 'View content drafts ready for review and approval',
}

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

export default async function ReadyContentPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  const isCreativeUser = isCreative(session)
  const isClientUser = isClient(session)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Drafts</h1>
      </div>
      
      <ReadyContentList 
        isCreativeUser={isCreativeUser}
        isClientUser={isClientUser}
      />
    </div>
  )
}