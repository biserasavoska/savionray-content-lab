import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import IdeasList from '@/components/ideas/IdeasList'
import { PageLayout, PageHeader, PageContent } from '@/components/ui/layout/PageLayout'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

export default async function IdeasPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <PageLayout size="full">
      <PageContent>
        <IdeasList />
      </PageContent>
    </PageLayout>
  )
}

