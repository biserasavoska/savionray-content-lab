import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's organizations
    const userOrganizations = await prisma.organizationUser.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      include: {
        organization: true,
      },
    })

    if (userOrganizations.length === 0) {
      return NextResponse.json({
        feedbacks: [],
        stats: {
          total: 0,
          averageRating: 0,
          actionable: 0,
          highPriority: 0,
          byCategory: {}
        }
      })
    }

    // Get organization IDs the user has access to
    const organizationIds = userOrganizations.map(ou => ou.organizationId)

    // Fetch feedbacks for all organizations the user has access to
    const feedbacks = await prisma.feedback.findMany({
      where: {
        contentDraft: {
          organizationId: {
            in: organizationIds
          }
        }
      },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
        contentDraft: {
          include: {
            idea: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Transform feedbacks to include target information
    const transformedFeedbacks = feedbacks.map(feedback => ({
      id: feedback.id,
      comment: feedback.comment,
      createdAt: feedback.createdAt.toISOString(),
      createdBy: feedback.createdBy,
      targetType: 'content' as const,
      targetTitle: feedback.contentDraft?.idea?.title || 'Unknown Content',
      targetId: feedback.contentDraft?.idea?.id || '',
    }))

    // Calculate stats
    const total = transformedFeedbacks.length
    const averageRating = 0 // Rating field doesn't exist in current schema
    const actionable = 0 // Actionable field doesn't exist in current schema
    const highPriority = 0 // Priority field doesn't exist in current schema
    
    const byCategory = { 'general': total } // Category field doesn't exist in current schema

    const stats = {
      total,
      averageRating,
      actionable,
      highPriority,
      byCategory,
    }

    return NextResponse.json({
      feedbacks: transformedFeedbacks,
      stats,
    })
  } catch (error) {
    console.error('Error fetching feedback management data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 