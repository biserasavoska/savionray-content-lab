import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions, isAdmin } from '@/lib/auth'
import DraftsList from '@/components/drafts/DraftsList'
import { DraftMetadata, DraftWithRelations } from '@/types/draft'
import { ContentDraft, DraftStatus } from '@prisma/client'
import { format } from 'date-fns'
import { VisualDraftsSection } from '@/components/visuals/VisualDraftsSection'

interface DraftsPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: DraftsPageProps): Promise<Metadata> {
  const idea = await prisma.idea.findUnique({
    where: { id: params.id },
    select: { title: true },
  })

  if (!idea) {
    return {
      title: 'Not Found',
    }
  }

  return {
    title: `Drafts - ${idea.title}`,
  }
}

export default async function DraftsPage({ params }: DraftsPageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const idea = await prisma.idea.findUnique({
    where: { id: params.id },
    include: {
      createdBy: {
        select: {
          name: true,
          email: true,
        },
      },
      visualDrafts: {
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

  if (!idea) {
    redirect('/ready-content')
  }

  const drafts = await prisma.contentDraft.findMany({
    where: { ideaId: params.id },
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
  })

  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Content Drafts</h1>
            <p className="mt-1 text-sm text-gray-500">
              For idea: {idea.title}
              <br />
              Created by {idea.createdBy.name || idea.createdBy.email} on{' '}
              {format(new Date(idea.createdAt), 'MMM d, yyyy')}
            </p>
          </div>
          <a
            href={`/ideas/${idea.id}/drafts/new`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Create New Draft
          </a>
        </div>
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Text Drafts</h2>
          <DraftsList drafts={drafts} ideaId={params.id} />
        </div>
        <VisualDraftsSection idea={idea} visualDrafts={idea.visualDrafts} />
      </div>
    </div>
  )
} 