import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DraftStatus } from '@prisma/client'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const draft = await prisma.contentDraft.findUnique({
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

    if (!draft) {
      return new NextResponse('Draft not found', { status: 404 })
    }

    return NextResponse.json(draft)
  } catch (error) {
    console.error('Error:', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    const { status, contentType, body: content, metadata } = body

    // Validate status
    if (!Object.values(DraftStatus).includes(status)) {
      return new NextResponse('Invalid status', { status: 400 })
    }

    // Get the existing draft
    const existingDraft = await prisma.contentDraft.findUnique({
      where: { id: params.id },
      include: {
        idea: true,
      },
    })

    if (!existingDraft) {
      return new NextResponse('Draft not found', { status: 404 })
    }

    // Only allow the creator to edit their drafts
    if (existingDraft.createdById !== session.user.id) {
      return new NextResponse('Unauthorized', { status: 403 })
    }

    // Update the draft
    const updatedDraft = await prisma.contentDraft.update({
      where: { id: params.id },
      data: {
        status,
        contentType,
        body: content,
        metadata,
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

    return NextResponse.json(updatedDraft)
  } catch (error) {
    console.error('Error:', error)
    return new NextResponse('Internal error', { status: 500 })
  }
} 