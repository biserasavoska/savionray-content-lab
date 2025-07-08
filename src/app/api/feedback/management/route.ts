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
      rating: feedback.rating || 0,
      category: feedback.category || 'general',
      priority: (feedback.priority as 'low' | 'medium' | 'high') || 'medium',
      actionable: feedback.actionable || false,
      createdAt: feedback.createdAt.toISOString(),
      createdBy: feedback.createdBy,
      targetType: 'content' as const,
      targetTitle: feedback.contentDraft?.idea?.title || 'Unknown Content',
      targetId: feedback.contentDraft?.idea?.id || '',
    }))

    // Calculate stats
    const total = transformedFeedbacks.length
    const averageRating = total > 0 
      ? transformedFeedbacks.reduce((sum, f) => sum + f.rating, 0) / total 
      : 0
    const actionable = transformedFeedbacks.filter(f => f.actionable).length
    const highPriority = transformedFeedbacks.filter(f => f.priority === 'high').length
    
    const byCategory = transformedFeedbacks.reduce((acc, feedback) => {
      const category = feedback.category
      acc[category] = (acc[category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

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