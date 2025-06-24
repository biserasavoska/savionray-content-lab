import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isCreative, isClient } from '@/lib/auth'
import ContentReviewList from './ContentReviewList'
import { DraftStatus } from '@prisma/client'

export default async function ContentReviewPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  const isCreativeUser = isCreative(session)
  const isClientUser = isClient(session)

  // Fetch content drafts for review - show drafts for approved ideas
  const drafts = await prisma.contentDraft.findMany({
    where: {
      ...(isCreativeUser ? { createdById: session.user.id } : {}),
      status: {
        in: ['DRAFT', 'AWAITING_FEEDBACK', 'AWAITING_REVISION', 'APPROVED', 'REJECTED', 'PUBLISHED'] as any
      }
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
      }
    },
    orderBy: {
      updatedAt: 'desc'
    }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Content Review</h1>
            <ContentReviewList 
              drafts={drafts} 
              isCreativeUser={isCreativeUser}
              isClientUser={isClientUser}
            />
          </div>
        </div>
      </div>
    </div>
  )
} 