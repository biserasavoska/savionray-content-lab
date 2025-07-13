import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import ReadyContentList from '@/components/ready-content/ReadyContentList'
import { logger } from '@/lib/utils/logger'
import { isClient, isCreative } from '@/lib/auth'
import { DRAFT_STATUS } from '@/lib/utils/enum-utils'
import { sanitizeContentDraftsData } from '@/lib/utils/data-sanitization'
import { getOrganizationContext } from '@/lib/utils/organization-context'
import { headers } from 'next/headers'

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
    // Fetch content drafts that are ready for publishing
    // This includes approved drafts and those awaiting final review
    const readyContent = await prisma.contentDraft.findMany({
      where: {
        // Always filter by organization for all users
        organizationId: orgContext.organizationId,
        // Additional filters based on user role
        ...(isCreativeUser ? { createdById: session.user.id } : {}),
        status: DRAFT_STATUS.AWAITING_FEEDBACK // Only show content awaiting client approval
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

    logger.info(`Ready Content: Found ${readyContent.length} items for user ${session.user.email}`, {
      userId: session.user.id,
      userEmail: session.user.email,
      itemCount: readyContent.length,
      organizationId: orgContext.organizationId
    })

    // Use the sanitization utility to ensure all user fields are non-null
    const safeReadyContent = sanitizeContentDraftsData(readyContent)

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ready Content</h1>
          <p className="text-gray-600">
            Content that has been created with AI and is ready for client review and approval.
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
    logger.error('Error loading ready content page', error as Error, {
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      organizationId: orgContext?.organizationId
    })
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