import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { isCreative, isAdmin } from '@/lib/auth'
import { CONTENT_TYPE, DRAFT_STATUS } from '@/lib/utils/enum-constants'
import { requireOrganizationContext } from '@/lib/utils/organization-context'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isCreative(session) && !isAdmin(session)) {
    return NextResponse.json({ error: 'Only creatives and admins can create content' }, { status: 403 })
  }

  try {
    const orgContext = await requireOrganizationContext()
    const { body, contentType } = await req.json()

    if (!body) {
      return NextResponse.json({ error: 'Content body is required' }, { status: 400 })
    }

    if (!contentType || !Object.values(CONTENT_TYPE).includes(contentType)) {
      return NextResponse.json({ error: 'Valid content type is required' }, { status: 400 })
    }

    const contentDraft = await prisma.contentDraft.create({
      data: {
        body,
        contentType: contentType as any,
        status: DRAFT_STATUS.DRAFT,
        ideaId: req.url.split('/').pop()!,
        createdById: session.user.id,
        organizationId: orgContext.organizationId,
      },
    })

    return NextResponse.json(contentDraft)
  } catch (error) {
    console.error('Failed to create content draft:', error)
    return NextResponse.json({ error: 'Failed to create content draft' }, { status: 500 })
  }
} 