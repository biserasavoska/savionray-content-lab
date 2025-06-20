import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { IdeaStatus, Prisma } from '@prisma/client'

export type IdeaFilters = {
  status?: IdeaStatus
  search?: string
  page?: number
  limit?: number
}

export async function getIdeas(filters: IdeaFilters = {}) {
  const {
    status,
    search,
    page = 1,
    limit = 10
  } = filters

  const skip = (page - 1) * limit

  const where: Prisma.IdeaWhereInput = {
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
            { description: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
          ],
        }
      : {}),
  }

  const [ideas, total] = await Promise.all([
    prisma.idea.findMany({
      where,
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
        contentDrafts: {
          select: {
            id: true,
            status: true,
            updatedAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    }),
    prisma.idea.count({ where }),
  ])

  return {
    ideas,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      page,
      limit,
    },
  }
}

export async function createIdea(data: {
  title: string
  description: string
  createdById: string
}) {
  const idea = await prisma.idea.create({
    data,
    include: {
      createdBy: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })

  revalidatePath('/ideas')
  return idea
}

export async function updateIdea(
  id: string,
  data: {
    title?: string
    description?: string
  }
) {
  const idea = await prisma.idea.update({
    where: { id },
    data,
    include: {
      createdBy: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })

  revalidatePath('/ideas')
  revalidatePath(`/ideas/${id}`)
  return idea
}

export async function updateIdeaStatus(
  id: string,
  status: IdeaStatus
) {
  const idea = await prisma.idea.update({
    where: { id },
    data: { status },
    include: {
      createdBy: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })

  revalidatePath('/ideas')
  revalidatePath(`/ideas/${id}`)
  return idea
}

export async function deleteIdea(id: string) {
  await prisma.idea.delete({
    where: { id },
  })

  revalidatePath('/ideas')
} 