import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isCreative } from '@/lib/auth'
import PublishedContentList from './PublishedContentList'
import { sanitizeContentDraftsData } from '@/lib/utils/data-sanitization'
import { DRAFT_STATUS } from '@/lib/utils/enum-utils'

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
      status: DRAFT_STATUS.PUBLISHED
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

  // Use the sanitization utility to ensure all user fields are non-null
  const safePublishedContent = sanitizeContentDraftsData(publishedContent)

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Published Content</h1>
        <p className="mt-2 text-gray-600">
          View all published content and scheduled posts
        </p>
      </div>

      <PublishedContentList 
        publishedContent={safePublishedContent} 
        isCreativeUser={isCreativeUser}
      />
    </div>
  )
} 