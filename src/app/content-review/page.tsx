import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isCreative, isClient } from '@/lib/auth'
import ContentReviewList from './ContentReviewList'

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
        in: [
          'DRAFT',
          'AWAITING_FEEDBACK',
          'AWAITING_REVISION',
          'APPROVED',
          'REJECTED'
        ]
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Content Review</h1>
      <ContentReviewList 
        drafts={drafts} 
        isCreativeUser={isCreativeUser}
        isClientUser={isClientUser}
      />
    </div>
  )
} 