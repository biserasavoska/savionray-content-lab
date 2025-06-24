import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DraftStatus } from '@prisma/client'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const draft = await prisma.contentDraft.findUnique({
      where: { id: params.id },
      include: {
        idea: {
          include: {
            createdBy: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    if (!draft) {
      return NextResponse.json({ error: 'Content draft not found' }, { status: 404 })
    }

    return NextResponse.json(draft)
  } catch (error) {
    console.error('Failed to fetch content draft:', error)
    return NextResponse.json(
      { error: 'Failed to fetch content draft' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { status, body, metadata } = await req.json()

    const updatedDraft = await prisma.contentDraft.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(body && { body }),
        ...(metadata && { metadata }),
      },
      include: {
        idea: {
          include: {
            createdBy: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
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
    console.error('Failed to update content draft:', error)
    return NextResponse.json(
      { error: 'Failed to update content draft' },
      { status: 500 }
    )
  }
} 