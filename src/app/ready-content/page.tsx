import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import ReadyContentList from '@/components/ready-content/ReadyContentList'
import { isClient, isCreative } from '@/lib/auth'
import { DRAFT_STATUS } from '@/lib/utils/enum-constants'
import { sanitizeContentDraftsData } from '@/lib/utils/data-sanitization'

export const metadata: Metadata = {
  title: 'Ready Content',
  description: 'View content ready for review and approval',
}

export default async function ReadyContentPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  const isCreativeUser = isCreative(session)
  const isClientUser = isClient(session)

  try {
    // Fetch content drafts that are ready for publishing
    // This includes approved drafts and those awaiting final review
    const readyContent = await prisma.contentDraft.findMany({
      where: {
        ...(isCreativeUser ? { createdById: session.user.id } : {}),
        status: {
          in: [
            DRAFT_STATUS.APPROVED,
            DRAFT_STATUS.AWAITING_FEEDBACK // Include drafts awaiting final client approval
          ]
        }
      },
      include: {
        idea: {
          include: {
            createdBy: {
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
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            image: true
          }
        },
        feedbacks: {
          include: {
            createdBy: {
              select: {
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        media: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: [
        {
          status: 'asc' // Approved content first
        },
        {
          updatedAt: 'desc'
        }
      ]
    })

    console.log(`Ready Content: Found ${readyContent.length} items for user ${session.user.email}`)

    // Use the sanitization utility to ensure all user fields are non-null
    const safeReadyContent = sanitizeContentDraftsData(readyContent)

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ready Content</h1>
          <p className="text-gray-600">
            Content that has been created with AI and is ready for publishing or final review.
          </p>
        </div>
        
        <ReadyContentList 
          content={safeReadyContent} 
          isCreativeUser={isCreativeUser}
          isClientUser={isClientUser}
        />
      </div>
    )
  } catch (error) {
    console.error('Error loading ready content page:', error)
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Ready Content</h1>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Content</h3>
          <p className="text-red-700">There was an error loading the ready content data. Please try refreshing the page.</p>
        </div>
      </div>
    )
  }
} 