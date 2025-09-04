import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

import ContentReviewList from './ContentReviewList'
import { authOptions, isCreative, isClient } from '@/lib/auth'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

export default async function ContentReviewPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  const isCreativeUser = isCreative(session)
  const isClientUser = isClient(session)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Content Creation</h1>
      
      <ContentReviewList 
        isCreativeUser={isCreativeUser}
        isClientUser={isClientUser}
      />
    </div>
  )
} 