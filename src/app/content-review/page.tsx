import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isCreative, isClient } from '@/lib/auth'
import { IDEA_STATUS, DRAFT_STATUS } from '@/lib/utils/enum-utils'
import ContentReviewList from './ContentReviewList'
import { sanitizeContentDraftsData } from '@/lib/utils/data-sanitization'
import { getOrganizationContext } from '@/lib/utils/organization-context'

export default async function ContentReviewPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  const isCreativeUser = isCreative(session)
  const isClientUser = isClient(session)

  // Get organization context for clients
  const orgContext = isClientUser ? await getOrganizationContext() : null

  try {
    // Fetch content drafts for review - show drafts for approved ideas
    const drafts = await prisma.contentDraft.findMany({
      where: {
        ...(isCreativeUser ? { createdById: session.user.id } : {}),
        ...(isClientUser && orgContext ? { organizationId: orgContext.organizationId } : {}),
        idea: {
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
        idea: {
          include: {
            createdBy: {
              select: { id: true, name: true, email: true, role: true, image: true }
            }
          }
        },
        createdBy: {
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