import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { isClient, isAdmin } from '@/lib/auth'
import { sendEmail, getStatusChangeEmailContent } from '@/lib/actions/email'
import { IdeaStatus } from '@prisma/client'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isClient(session) && !isAdmin(session)) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
  }

  try {
    const { status } = await req.json()

    if (!status || !['APPROVED_BY_CLIENT', 'REJECTED_BY_CLIENT'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be APPROVED_BY_CLIENT or REJECTED_BY_CLIENT' },
        { status: 400 }
      )
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
      },
    })

    if (!idea) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 })
    }

    const updatedIdea = await prisma.idea.update({
      where: { id: params.id },
      data: {
        status: status as IdeaStatus,
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

    // Send email notification to the idea creator
    if (idea.createdBy.email) {
      const feedbackUrl = `${process.env.NEXTAUTH_URL}/ideas/${idea.id}`
      
      await sendEmail({
        to: idea.createdBy.email,
        subject: `Content Idea Status Update: ${status}`,
        html: getStatusChangeEmailContent(
          idea.title,
          status as IdeaStatus,
          feedbackUrl
        ),
      })
    }

    return NextResponse.json(updatedIdea)
  } catch (error) {
    console.error('Failed to update idea status:', error)
    return NextResponse.json(
      { error: 'Failed to update idea status' },
      { status: 500 }
    )
  }
} 