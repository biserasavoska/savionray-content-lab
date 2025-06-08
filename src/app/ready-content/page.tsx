import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { isCreative, isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ContentList from './ContentList'

export default async function ReadyContentPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  if (!isCreative(session) && !isAdmin(session)) {
    redirect('/dashboard')
  }

  // Fetch approved ideas and their content drafts
  const ideas = await prisma.idea.findMany({
    where: {
      status: 'APPROVED_BY_CLIENT',
      ...(isCreative(session) ? { createdById: session.user.id } : {}),
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
  })

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Ready Content</h1>
          <p className="mt-2 text-sm text-gray-600">
            Create and manage content for approved ideas.
          </p>
        </div>

        <ContentList ideas={ideas} />
      </div>
    </div>
  )
} 