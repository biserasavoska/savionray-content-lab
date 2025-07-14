import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { IdeaStatus } from '@prisma/client'

import { authOptions , isClient, isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import IdeaCard from '@/components/ideas/IdeaCard'

export default async function ReviewIdeasPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  if (!isClient(session) && !isAdmin(session)) {
    redirect('/dashboard')
  }

  // Get user's organizations for filtering
  const userOrganizations = await prisma.organizationUser.findMany({
    where: {
      userId: session.user.id,
      isActive: true,
    },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          slug: true,
          primaryColor: true,
        },
      },
    },
    orderBy: {
      joinedAt: 'desc',
    },
  })

  // For now, use the first organization. In a real app, you'd get the current organization from context
  const currentOrgId = userOrganizations[0]?.organizationId

  // Fetch initial ideas pending review for the current organization
  const ideas = await prisma.idea.findMany({
    where: {
      status: IdeaStatus.PENDING,
      ...(currentOrgId && { organizationId: currentOrgId }),
    },
    include: {
      createdBy: {
        select: {
          name: true,
          email: true,
        },
      },
      organization: {
        select: {
          id: true,
          name: true,
          slug: true,
          primaryColor: true,
        },
      },
      contentDrafts: {
        include: {
          createdBy: {
            select: {
              name: true,
              email: true,
            },
          },
          feedbacks: {
            include: {
              createdBy: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
      comments: {
        include: {
          createdBy: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 10,
  })

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Review Content Ideas</h1>
          <p className="mt-2 text-sm text-gray-600">
            Review and provide feedback on content ideas submitted by creatives.
          </p>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ideas.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      </div>
    </div>
  )
} 