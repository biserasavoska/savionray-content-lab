import { revalidatePath } from 'next/cache'
import { IdeaStatus, Prisma } from '@prisma/client'

import { prisma } from '@/lib/prisma'
import { requireOrganizationContext, createOrgFilter } from '@/lib/utils/organization-context'

export type IdeaFilters = {
  status?: string
  search?: string
  page?: number
  limit?: number
}

export async function getIdeas(filters: IdeaFilters = {}) {
  // Get organization context for multi-tenant isolation
  const orgContext = await requireOrganizationContext();
  
  const {
    status,
    search,
    page = 1,
    limit = 10
  } = filters

  const skip = (page - 1) * limit

  // Create organization-aware filter
  const orgFilter = createOrgFilter(orgContext.organizationId);

  const where: any = {
    ...orgFilter, // Add organization filter
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
  }

  const [ideas, total] = await Promise.all([
    prisma.idea.findMany({
      where,
      include: {
        User: {
          select: {
            name: true,
            email: true,
          },
        },
        ContentDraft: {
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
  // Get organization context for multi-tenant isolation
  const orgContext = await requireOrganizationContext();

  const idea = await prisma.idea.create({
    data: {
      ...data,
      organizationId: orgContext.organizationId, // Add organization isolation
    },
    include: {
      User: {
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
  // Get organization context and validate access
  const orgContext = await requireOrganizationContext();
  
  // Validate that the idea belongs to the user's organization
  const idea = await prisma.idea.findUnique({
    where: { 
      id,
      organizationId: orgContext.organizationId
    }
  });

  if (!idea) {
    throw new Error('Idea not found or access denied');
  }

  const updatedIdea = await prisma.idea.update({
    where: { id },
    data,
    include: {
      User: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })

  revalidatePath('/ideas')
  revalidatePath(`/ideas/${id}`)
  return updatedIdea
}

export async function updateIdeaStatus(
  id: string,
  status: IdeaStatus
) {
  // Get organization context and validate access
  const orgContext = await requireOrganizationContext();
  
  // Validate that the idea belongs to the user's organization
  const idea = await prisma.idea.findUnique({
    where: { 
      id,
      organizationId: orgContext.organizationId
    }
  });

  if (!idea) {
    throw new Error('Idea not found or access denied');
  }

  const updatedIdea = await prisma.idea.update({
    where: { id },
    data: { status },
    include: {
      User: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })

  revalidatePath('/ideas')
  revalidatePath(`/ideas/${id}`)
  return updatedIdea
}

export async function deleteIdea(id: string) {
  // Get organization context and validate access
  const orgContext = await requireOrganizationContext();
  
  // Validate that the idea belongs to the user's organization
  const idea = await prisma.idea.findUnique({
    where: { 
      id,
      organizationId: orgContext.organizationId
    }
  });

  if (!idea) {
    throw new Error('Idea not found or access denied');
  }

  await prisma.idea.delete({
    where: { id },
  })

  revalidatePath('/ideas')
} 