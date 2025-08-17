import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

import { prisma } from '@/lib/prisma'
import { authOptions , isAdmin, isCreative } from '@/lib/auth'
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
  const isClientUser = session.user.role === 'CLIENT'

  // All authenticated users can access approved content
  if (!isAdminUser && !isCreativeUser && !isClientUser) {
    redirect('/')
  }

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

  // Get organization context
  const orgContext = await getOrganizationContext(undefined, mockRequest)
  
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
        Feedback: {
          include: {
            User: {
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
        Media: {
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
          isClientUser={isClientUser}
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