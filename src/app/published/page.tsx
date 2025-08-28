import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

import PublishedContentList from './PublishedContentList'

import { authOptions , isCreative } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sanitizeContentDraftsData } from '@/lib/utils/data-sanitization'
import { DRAFT_STATUS } from '@/lib/utils/enum-utils'
import { getOrganizationContext } from '@/lib/utils/organization-context'
import { PageLayout, PageHeader, PageContent, PageSection } from '@/components/ui/layout/PageLayout'

export default async function PublishedPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  const isCreativeUser = isCreative(session)

  // Get headers to access cookies
  const headersList = await headers()
  
  // Create a mock request object to pass to getOrganizationContext
  const mockRequest = {
    cookies: {
      get: (name: string) => {
        const cookieHeader = headersList.get('cookie')
        if (!cookieHeader) return null
        
        const cookies = cookieHeader.split(';').reduce((acc: any, cookie) => {
          const [key, value] = cookie.trim().split('=')
          acc[key] = value
          return acc
        }, {})
        
        return cookies[name] ? { value: cookies[name] } : null
      }
    },
    headers: {
      get: (name: string) => headersList.get(name)
    }
  } as any

  // Get organization context for ALL users (including admins)
  const orgContext = await getOrganizationContext(undefined, mockRequest)
  
  if (!orgContext) {
    redirect('/')
  }

  // Fetch published content
  const publishedContent = await prisma.contentDraft.findMany({
    where: {
      // Always filter by organization for all users
      organizationId: orgContext.organizationId,
      // Additional filters based on user role
      ...(isCreativeUser ? { createdById: session.user.id } : {}),
      status: DRAFT_STATUS.PUBLISHED
    },
    include: {
      Idea: {
        include: {
          User: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              image: true
            }
          }
        }
      },
      User: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          image: true
        }
      },
      scheduledPosts: {
        orderBy: {
          scheduledDate: 'desc'
        }
      }
    },
    orderBy: {
      updatedAt: 'desc'
    }
  })

  // Use the sanitization utility to ensure all user fields are non-null
  const safePublishedContent = sanitizeContentDraftsData(publishedContent)

  return (
    <PageLayout>
      <PageHeader
        title="Published Content"
        description="View all published content and scheduled posts"
      />
      <PageContent>
        <PageSection>
          <PublishedContentList 
            publishedContent={safePublishedContent} 
            isCreativeUser={isCreativeUser}
          />
        </PageSection>
      </PageContent>
    </PageLayout>
  )
} 