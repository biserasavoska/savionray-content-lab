import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 DEBUG: Chat conversations API called')
    const session = await getServerSession(authOptions)
    console.log('🔍 DEBUG: Session check result:', session?.user ? 'authenticated' : 'not authenticated')
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's conversations
    const conversations = await prisma.chatConversation.findMany({
      where: {
        createdById: session.user.id,
        isArchived: false
      },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            messages: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: 20
    })

    return NextResponse.json({ conversations })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error')
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, model = 'gpt-4o-mini' } = await req.json()

    // Get user's organization ID
    const userOrg = await prisma.organizationUser.findFirst({
      where: {
        userId: session.user.id,
        isActive: true
      },
      select: {
        organizationId: true
      }
    })

    if (!userOrg) {
      return NextResponse.json({ error: 'No active organization found' }, { status: 400 })
    }

    const conversation = await prisma.chatConversation.create({
      data: {
        title: title || 'New Chat',
        model,
        createdById: session.user.id,
        organizationId: userOrg.organizationId
      },
      include: {
        messages: true,
        _count: {
          select: {
            messages: true
          }
        }
      }
    })

    return NextResponse.json({ conversation })
  } catch (error) {
    console.error('Error creating conversation:', error)
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error')
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
