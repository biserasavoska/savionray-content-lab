import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { isCreative } from '@/lib/auth'
import CreateContentList from '@/components/create-content/CreateContentList'
import { IdeaStatus } from '@prisma/client'

export const metadata: Metadata = {
  title: 'Create Content',
  description: 'Create and edit content for approved ideas',
}

export default async function CreateContentPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  // Only creatives can access this page
  if (!isCreative(session)) {
    redirect('/ready-content')
  }

  // Show ideas that are approved by client and ready for content creation
  const items = await prisma.idea.findMany({
    where: {
      status: 'APPROVED' as any,
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
          <h1 className="text-2xl font-semibold text-gray-900">Create Content</h1>
        </div>

        <div className="mt-8">
          <CreateContentList items={items} />
        </div>
      </div>
    </div>
  )
} 