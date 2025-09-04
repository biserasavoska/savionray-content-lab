import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

import ContentReviewList from './ContentReviewList'

import { authOptions , isCreative, isClient } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { IDEA_STATUS, DRAFT_STATUS } from '@/lib/utils/enum-utils'
import { sanitizeContentDraftsData } from '@/lib/utils/data-sanitization'
import { getOrganizationContext } from '@/lib/utils/organization-context'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'


export default async function ContentReviewPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  const isCreativeUser = isCreative(session)
  const isClientUser = isClient(session)

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

  try {
    // Fetch content drafts for review - show drafts for approved ideas
    const drafts = await prisma.contentDraft.findMany({
      where: {
        // Always filter by organization for all users
        organizationId: orgContext.organizationId,
        // Additional filters based on user role
        ...(isCreativeUser ? { createdById: session.user.id } : {}),
        Idea: {
          status: IDEA_STATUS.APPROVED
        },
        status: {
          in: [
            DRAFT_STATUS.DRAFT, 
            DRAFT_STATUS.AWAITING_FEEDBACK, 
            DRAFT_STATUS.AWAITING_REVISION, 
            DRAFT_STATUS.APPROVED, 
            DRAFT_STATUS.REJECTED
          ]
        }
      },
      include: {
        Idea: {
          include: {
            User: {
              select: { id: true, name: true, email: true, role: true, image: true }
            }
          }
        },
        User: {
          select: { id: true, name: true, email: true, role: true, image: true }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    // Use the sanitization utility to ensure all user fields are non-null
    const safeDrafts = sanitizeContentDraftsData(drafts)

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Content Review</h1>
        
        <ContentReviewList 
          drafts={safeDrafts} 
          isCreativeUser={isCreativeUser}
          isClientUser={isClientUser}
        />
      </div>
    )
  } catch (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Content Review</h1>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Content</h3>
          <p className="text-red-700">There was an error loading the content review data. Please try refreshing the page.</p>
        </div>
      </div>
    )
  }
} 