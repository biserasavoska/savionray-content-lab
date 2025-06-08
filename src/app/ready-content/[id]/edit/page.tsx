import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { isCreative, isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ContentEditor from './ContentEditor'

export default async function EditContentPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  if (!isCreative(session) && !isAdmin(session)) {
    redirect('/dashboard')
  }

  const idea = await prisma.idea.findUnique({
    where: {
      id: params.id,
      status: 'APPROVED_BY_CLIENT',
      ...(isCreative(session) ? { createdById: session.user.id } : {}),
    },
    include: {
      contentDrafts: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
        include: {
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
      },
    },
  })

  if (!idea) {
    redirect('/ready-content')
  }

  // Create a new content draft if none exists
  let contentDraft = idea.contentDrafts[0]
  if (!contentDraft) {
    contentDraft = await prisma.contentDraft.create({
      data: {
        body: '',
        ideaId: idea.id,
        createdById: session.user.id,
      },
      include: {
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
    })
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Content</h1>
          <p className="mt-2 text-sm text-gray-600">
            Create or edit content for your approved idea.
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">{idea.title}</h2>
            <p className="mt-2 text-gray-600">{idea.description}</p>
          </div>

          <ContentEditor
            ideaId={idea.id}
            contentDraftId={contentDraft.id}
            initialContent={contentDraft.body}
            feedbacks={contentDraft.feedbacks || []}
          />
        </div>
      </div>
    </div>
  )
} 