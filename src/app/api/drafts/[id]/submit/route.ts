import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { prisma } from '@/lib/prisma'
import { authOptions , isCreative, isAdmin } from '@/lib/auth'
import { getOrganizationContext } from '@/lib/utils/organization-context'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isCreative(session) && !isAdmin(session)) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
  }

  try {
    // Get organization context
    const orgContext = await getOrganizationContext(undefined, req)
    
    if (!orgContext) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Parse request body to get content updates
    const requestBody = await req.json()
    const { body: contentBody, contentType, metadata } = requestBody

    const draft = await prisma.contentDraft.findUnique({
      where: { 
        id: params.id,
        organizationId: orgContext.organizationId
      },
      include: {
        Idea: true,
      },
    })

    if (!draft) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 })
    }

    // Only the creator or admin can submit the draft
    if (!isAdmin(session) && draft.createdById !== session.user.id) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Prepare update data - include body content if provided
    const updateData: any = {
      status: 'AWAITING_FEEDBACK',
      updatedAt: new Date(),
    }

    // Update body content if provided
    if (contentBody !== undefined) {
      updateData.body = contentBody
    }

    // Update contentType if provided
    if (contentType) {
      updateData.contentType = contentType
    }

    // Update metadata if provided
    if (metadata) {
      updateData.metadata = {
        ...(draft.metadata as any || {}),
        ...metadata,
      }
    }

    // Update draft status and content to await feedback
    const updatedDraft = await prisma.contentDraft.update({
      where: { 
        id: params.id,
        organizationId: orgContext.organizationId
      },
      data: updateData,
      include: {
        User: {
          select: {
            name: true,
            email: true,
          },
        },
        Idea: {
          select: {
            title: true,
          },
        },
      },
    })

    return NextResponse.json(updatedDraft)
  } catch (error) {
    console.error('Failed to submit draft:', error)
    return NextResponse.json(
      { error: 'Failed to submit draft' },
      { status: 500 }
    )
  }
} 