import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isCreative } from '@/lib/auth'
import PublishedContentList from './PublishedContentList'

export default async function PublishedPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  const isCreativeUser = isCreative(session)

  // Fetch published content
  const publishedContent = await prisma.contentDraft.findMany({
    where: {
      ...(isCreativeUser ? { createdById: session.user.id } : {}),
      status: 'PUBLISHED'
    },
    include: {
      idea: {
        include: {
          createdBy: {
            select: {
              name: true,
              email: true
            }
          }
        }
      },
      createdBy: {
        select: {
          name: true,
          email: true
        }
      },
      scheduledPosts: {
        orderBy: {
          scheduledDate: 'desc'
        }
      }
    },
    orderBy: {
      updatedAt: 'desc'
    }
  })

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Published Content</h1>
        <p className="mt-2 text-gray-600">
          View all published content and scheduled posts
        </p>
      </div>

      <PublishedContentList 
        publishedContent={publishedContent} 
        isCreativeUser={isCreativeUser}
      />
    </div>
  )
} 