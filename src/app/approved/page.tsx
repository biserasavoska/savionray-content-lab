import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { isAdmin, isCreative } from '@/lib/auth'
import { getOrganizationContext } from '@/lib/utils/organization-context'
import { DRAFT_STATUS } from '@/lib/utils/enum-constants'
import { logger } from '@/lib/utils/logger'
import ApprovedContentList from '@/components/approved-content/ApprovedContentList'

export default async function ApprovedContentPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  const isAdminUser = isAdmin(session)
  const isCreativeUser = isCreative(session)

  // Only admins and creatives can access approved content
  if (!isAdminUser && !isCreativeUser) {
    redirect('/')
  }

  // Get organization context
  const orgContext = await getOrganizationContext()
  
  if (!orgContext) {
    redirect('/')
  }

  try {
    // Fetch approved content drafts
    const approvedContent = await prisma.contentDraft.findMany({
      where: {
        organizationId: orgContext.organizationId,
        status: DRAFT_STATUS.APPROVED
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
      orderBy: {
        updatedAt: 'desc'
      }
    })

    logger.info('Approved Content: Found approved items', {
      userId: session.user.id,
      userEmail: session.user.email,
      itemCount: approvedContent.length,
      organizationId: orgContext.organizationId
    })

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Approved Content
          </h1>
          <p className="text-gray-600">
            Content that has been approved by clients and is ready for publishing
          </p>
        </div>

        <ApprovedContentList 
          content={approvedContent}
          isAdminUser={isAdminUser}
          isCreativeUser={isCreativeUser}
        />
      </div>
    )
  } catch (error) {
    logger.error('Error fetching approved content', error instanceof Error ? error : new Error('Unknown error'), {
      userId: session.user.id,
      organizationId: orgContext.organizationId
    })

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            Error loading approved content. Please try again.
          </p>
        </div>
      </div>
    )
  }
} 