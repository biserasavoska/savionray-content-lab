import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { sendEmail, getFeedbackEmailContent } from '@/lib/actions/email'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { comment } = await req.json()

    if (!comment) {
      return NextResponse.json({ error: 'Comment is required' }, { status: 400 })
    }

    // Check if idea exists and get creator info
    const idea = await prisma.idea.findUnique({
      where: { id: params.id },
      include: {
        createdBy: {
          select: {
            email: true,
          },
        },
      },
    })

    if (!idea) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 })
    }

    const feedback = await prisma.feedback.create({
      data: {
        comment,
        contentDraft: {
          create: {
            body: '',
            idea: {
              connect: { id: params.id },
            },
            createdBy: {
              connect: { id: session.user.id },
            },
          },
        },
        createdBy: {
          connect: { id: session.user.id },
        },
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
        subject: 'New Feedback on Your Content Idea',
        html: getFeedbackEmailContent(
          idea.title,
          feedbackUrl
        ),
      })
    }

    return NextResponse.json(feedback)
  } catch (error) {
    console.error('Failed to create feedback:', error)
    return NextResponse.json({ error: 'Failed to create feedback' }, { status: 500 })
  }
} 