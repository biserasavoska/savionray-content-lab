import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getOrganizationContext } from '@/lib/utils/organization-context'
import { headers } from 'next/headers'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

interface ReadyContentPageProps {
  params: {
    id: string
  }
}

export default async function ReadyContentPage({ params }: ReadyContentPageProps) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    notFound()
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
    notFound()
  }

  try {
    // Fetch the specific content draft
    const contentDraft = await prisma.contentDraft.findUnique({
      where: {
        id: params.id,
        organizationId: orgContext.organizationId
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
        }
      }
    })
    
    if (!contentDraft) {
      notFound()
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {contentDraft.Idea?.title || 'Draft'}
          </h1>
          <p className="text-gray-600 mb-4">
            This content is ready for review and editing.
          </p>
          <div className="mb-4">
            <p className="text-sm text-gray-500">
              <strong>Status:</strong> {contentDraft.status}
            </p>
            <p className="text-sm text-gray-500">
              <strong>Created by:</strong> {contentDraft.User?.name || 'Unknown'}
            </p>
          </div>
          <a
            href={`/ready-content/${params.id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Edit Content
          </a>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error fetching content draft:', error)
    notFound()
  }
}
