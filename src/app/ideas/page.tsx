import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import IdeasList from '@/components/ideas/IdeasList'
import { PageLayout, PageHeader, PageContent } from '@/components/ui/layout/PageLayout'

export default async function IdeasPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <PageLayout size="full">
      <PageHeader
        title="Content Ideas"
        description="Review and manage your pending and rejected content ideas. Approved ideas automatically move to Content Status for content creation."
      />
      
      <PageContent>
        <IdeasList />
      </PageContent>
    </PageLayout>
  )
}

