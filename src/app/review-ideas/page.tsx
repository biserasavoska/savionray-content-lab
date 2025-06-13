import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { isClient, isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { IdeaStatus } from '@prisma/client'
import IdeaCard from '@/components/ideas/IdeaCard'

export default async function ReviewIdeasPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  if (!isClient(session) && !isAdmin(session)) {
    redirect('/dashboard')
  }

  // Fetch initial ideas pending review
  const ideas = await prisma.idea.findMany({
    where: {
      status: IdeaStatus.PENDING_CLIENT_APPROVAL,
    },
    include: {
      createdBy: {
        select: {
          name: true,
          email: true,
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