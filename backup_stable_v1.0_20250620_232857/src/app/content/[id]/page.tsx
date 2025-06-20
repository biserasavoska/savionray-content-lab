import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import IdeaFeedbackPanel from '@/components/ideas/IdeaFeedbackPanel'
import { Idea, User, ContentDraft, IdeaComment } from '@prisma/client'

interface ContentPageProps {
  params: {
    id: string
  }
}

type IdeaWithDrafts = Idea & {
  contentDrafts: (ContentDraft & {
    createdBy: Pick<User, 'name' | 'email'>
    feedbacks: {
      id: string
      comment: string
      createdAt: Date
      createdBy: Pick<User, 'name' | 'email'>
    }[]
  })[]
  createdBy: Pick<User, 'name' | 'email'>
  comments: (IdeaComment & {
    createdBy: Pick<User, 'name' | 'email'>
  })[]
}

export async function generateMetadata({ params }: ContentPageProps): Promise<Metadata> {
  const idea = await prisma.idea.findUnique({
    where: { id: params.id },
    select: { title: true },
  })

  return {
    title: idea ? `${idea.title} - Content Details` : 'Content Details',
  }
}

export default async function ContentPage({ params }: ContentPageProps) {
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
      comments: {
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
          feedbacks: {
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
      },
    },
  }) as IdeaWithDrafts | null

  if (!idea) {
    redirect('/ready-content')
  }

  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{idea.title}</h1>
            <p className="mt-1 text-sm text-gray-500">
              Created by {idea.createdBy.name || idea.createdBy.email} on{' '}
              {format(new Date(idea.createdAt), 'MMM d, yyyy')}
            </p>
          </div>
          <div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
              ${idea.contentType === 'BLOG_POST' ? 'bg-blue-100 text-blue-800' :
                idea.contentType === 'SOCIAL_MEDIA_POST' ? 'bg-green-100 text-green-800' :
                idea.contentType === 'NEWSLETTER' ? 'bg-purple-100 text-purple-800' :
                'bg-gray-100 text-gray-800'}`}
            >
              {idea.contentType?.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        <div className="mt-6">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Description</h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>{idea.description}</p>
              </div>
              {idea.publishingDateTime && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-500">
                    Publishing Date: {format(new Date(idea.publishingDateTime), 'MMMM d, yyyy')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <IdeaFeedbackPanel idea={idea} />
        </div>
      </div>
    </div>
  )
} 