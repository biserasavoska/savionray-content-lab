import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isCreative, isClient } from '@/lib/auth'
import { IDEA_STATUS, DRAFT_STATUS } from '@/lib/utils/enum-constants'
import ContentReviewList from './ContentReviewList'

export default async function ContentReviewPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  const isCreativeUser = isCreative(session)
  const isClientUser = isClient(session)

  try {
    // Fetch content drafts for review - show drafts for approved ideas
    // Using centralized enum constants to prevent enum mismatches
    const drafts = await prisma.contentDraft.findMany({
      where: {
        ...(isCreativeUser ? { createdById: session.user.id } : {}),
        idea: {
          status: IDEA_STATUS.APPROVED // Only show drafts for approved ideas
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
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        createdBy: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    console.log(`Content Review: Found ${drafts.length} drafts for user ${session.user.email}`)

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Content Review</h1>
        <ContentReviewList 
          drafts={drafts} 
          isCreativeUser={isCreativeUser}
          isClientUser={isClientUser}
        />
      </div>
    )
  } catch (error) {
    console.error('Error loading content review page:', error)
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