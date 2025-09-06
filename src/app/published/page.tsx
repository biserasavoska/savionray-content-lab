import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

import { authOptions, isCreative } from '@/lib/auth'
import PublishedContentList from '@/app/published/PublishedContentList'
import { PageLayout, PageHeader, PageContent, PageSection } from '@/components/ui/layout/PageLayout'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

export default async function PublishedPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  const isCreativeUser = isCreative(session)

  return (
    <PageLayout>
      <PageHeader
        title="Published Content"
        description="View all published content and scheduled posts"
      />
      <PageContent>
        <PageSection>
          <PublishedContentList 
            isCreativeUser={isCreativeUser}
          />
        </PageSection>
      </PageContent>
    </PageLayout>
  )
}