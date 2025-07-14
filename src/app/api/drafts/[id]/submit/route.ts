import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { prisma } from '@/lib/prisma'
import { authOptions , isCreative, isAdmin } from '@/lib/auth'

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
    const draft = await prisma.contentDraft.findUnique({
      where: { id: params.id },
      include: {
        idea: true,
      },
    })

    if (!draft) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 })
    }

    // Only the creator or admin can submit the draft
    if (!isAdmin(session) && draft.createdById !== session.user.id) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Update draft status to await feedback
    const updatedDraft = await prisma.contentDraft.update({
      where: { id: params.id },
      data: {
        status: 'DRAFT',
      },
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