import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import DraftsList from '@/components/drafts/DraftsList'

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
  if (!session?.user?.id) return null

  const idea = await prisma.idea.findUnique({
    where: { id: params.id },
    include: {
      contentDrafts: {
        include: {
          createdBy: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
      },
    },
  })

  if (!idea) {
    notFound()
  }

  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">{idea.title} - Drafts</h1>
          <a
            href={`/ideas/${idea.id}/drafts/new`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
          >
            New Draft
          </a>
        </div>
        <div className="mt-8">
          <DraftsList drafts={idea.contentDrafts} ideaId={idea.id} />
        </div>
      </div>
    </div>
  )
} 