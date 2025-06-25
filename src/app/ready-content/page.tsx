import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import ReadyContentList from '@/components/ready-content/ReadyContentList'
import { isClient, isCreative } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Ready Content',
  description: 'View content ready for review and approval',
}

export default async function ReadyContentPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  // For creatives, redirect to create content page
  if (isCreative(session)) {
    redirect('/create-content')
  }

  // For clients, show ideas with drafts that need review
  const items = await prisma.idea.findMany({
    where: {
      contentDrafts: {
        some: {
          OR: [
            { status: 'DRAFT' },
            { status: 'AWAITING_FEEDBACK' }
          ]
        }
      }
    },
    include: {
      createdBy: {
        select: {
          name: true,
          email: true,
        },
      },
      contentDrafts: {
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          createdBy: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: [
      {
        publishingDateTime: 'asc',
      },
      {
        createdAt: 'desc',
      },
    ],
  })

  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Ready Content</h1>
        </div>

        <div className="mt-8">
          <ReadyContentList items={items} />
        </div>
      </div>
    </div>
  )
} 