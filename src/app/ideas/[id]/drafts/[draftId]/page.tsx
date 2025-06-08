import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { ContentDraft, Feedback, User } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import FeedbackForm from '@/components/feedback/FeedbackForm'
import FeedbackList from '@/components/feedback/FeedbackList'
import { DraftWithMetadata } from '@/types/draft'

interface DraftDetailsPageProps {
  params: {
    id: string
    draftId: string
  }
}

type DraftWithRelations = ContentDraft & {
  idea: {
    id: string
    title: string
  }
  createdBy: Pick<User, 'name' | 'email'>
  feedbacks: (Feedback & {
    createdBy: Pick<User, 'name' | 'email'>
  })[]
}

export async function generateMetadata({ params }: DraftDetailsPageProps): Promise<Metadata> {
  const draft = await prisma.contentDraft.findUnique({
    where: { id: params.draftId },
    include: {
      idea: {
        select: { title: true },
      },
    },
  })

  if (!draft) {
    return {
      title: 'Not Found',
    }
  }

  return {
    title: `Draft - ${draft.idea.title}`,
  }
}

export default async function DraftDetailsPage({ params }: DraftDetailsPageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  const draft = (await prisma.contentDraft.findUnique({
    where: { id: params.draftId },
    include: {
      idea: true,
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
  })) as (DraftWithRelations & DraftWithMetadata) | null

  if (!draft) {
    notFound()
  }

  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">
            {draft.idea.title} - Draft Review
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              Created by {draft.createdBy.name || draft.createdBy.email}
            </span>
            <a
              href={`/ideas/${params.id}/drafts`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Back to Drafts
            </a>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-8">
          <div className="col-span-2 space-y-6">
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-sm font-medium text-gray-500">Content Type:</span>
                  <span className="text-sm font-medium text-red-600">
                    {draft.metadata?.contentType || 'Unknown Type'}
                  </span>
                </div>
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: draft.body }} />
              </div>
            </div>
          </div>

          <div className="col-span-1 space-y-6">
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Feedback</h3>
                <FeedbackForm draftId={draft.id} />
              </div>
            </div>

            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Review History</h3>
                <FeedbackList feedbacks={draft.feedbacks} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 