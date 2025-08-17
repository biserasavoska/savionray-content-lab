import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { prisma } from '@/lib/prisma'
import { authOptions , isClient } from '@/lib/auth'
import { DRAFT_STATUS } from '@/lib/utils/enum-constants'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isClient(session)) {
    return NextResponse.json({ error: 'Only clients can approve drafts' }, { status: 403 })
  }

  try {
    const draft = await prisma.contentDraft.findUnique({
      where: { id: params.id },
      include: {
        Idea: true,
      },
    })

    if (!draft) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 })
    }

    if (draft.status === DRAFT_STATUS.APPROVED) {
      return NextResponse.json({ error: 'Draft is already approved' }, { status: 400 })
    }

    // Update the draft status
    const updatedDraft = await prisma.contentDraft.update({
      where: { id: params.id },
      data: {
        status: DRAFT_STATUS.APPROVED,
      },
    })

    return NextResponse.json(updatedDraft)
  } catch (error) {
    console.error('Error approving draft:', error)
    return NextResponse.json(
      { error: 'Failed to approve draft' },
      { status: 500 }
    )
  }
} 