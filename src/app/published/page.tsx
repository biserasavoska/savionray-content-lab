'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { isCreative } from '@/lib/auth'
import PublishedContentList from '@/app/published/PublishedContentList'
import { PageLayout, PageHeader, PageContent, PageSection } from '@/components/ui/layout/PageLayout'

export default function PublishedPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // Still loading

    if (!session) {
      router.push('/auth/signin')
      return
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <PageLayout>
        <PageHeader
          title="Published Content"
          description="View all published content and scheduled posts"
        />
        <PageContent>
          <PageSection>
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Loading...</div>
            </div>
          </PageSection>
        </PageContent>
      </PageLayout>
    )
  }

  if (!session) {
    return null // Will redirect
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