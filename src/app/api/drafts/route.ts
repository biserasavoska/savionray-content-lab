import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { isCreative, isAdmin } from '@/lib/auth'
import { CONTENT_TYPE } from '@/lib/utils/enum-constants'
import { requireOrganizationContext, createOrgFilter } from '@/lib/utils/organization-context'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isCreative(session) && !isAdmin(session)) {
    return NextResponse.json({ error: 'Only creatives and admins can create drafts' }, { status: 403 })
  }

  try {
    const { body, ideaId, contentType, metadata } = await req.json()

    if (!body) {
      return NextResponse.json({ error: 'Content body is required' }, { status: 400 })
    }

    if (!ideaId) {
      return NextResponse.json({ error: 'Idea ID is required' }, { status: 400 })
    }

    if (!contentType || !Object.values(CONTENT_TYPE).includes(contentType)) {
      return NextResponse.json({ error: 'Valid content type is required' }, { status: 400 })
    }

    // Get organization context for multi-tenant isolation
    const orgContext = await requireOrganizationContext();

    const draft = await prisma.contentDraft.create({
      data: {
        body,
        ideaId,
        contentType: contentType as any,
        status: 'DRAFT',
        createdById: session.user.id,
        organizationId: orgContext.organizationId,
        metadata: metadata || {},
      },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(draft)
  } catch (error) {
    console.error('Failed to create draft:', error)
    return NextResponse.json({ error: 'Failed to create draft' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const ideaId = searchParams.get('ideaId')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const skip = (page - 1) * limit

  try {
    // Get organization context for multi-tenant isolation
    const orgContext = await requireOrganizationContext();
    
    const where = {
      ...(ideaId ? { ideaId } : {}),
      ...(isCreative(session) ? { createdById: session.user.id } : {}),
      ...createOrgFilter(orgContext.organizationId), // Add organization filter
    }

    const [drafts, total] = await Promise.all([
      prisma.contentDraft.findMany({
        where,
        include: {
          createdBy: {
            select: {
              name: true,
              email: true,
            },
          },
          idea: {
            select: {
              title: true,
              status: true,
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.contentDraft.count({ where }),
    ])

    return NextResponse.json({
      drafts,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    })
  } catch (error) {
    console.error('Failed to fetch drafts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch drafts' },
      { status: 500 }
    )
  }
} 