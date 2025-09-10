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

    // Fetch feedbacks for all organizations the user has access to - includes both Ideas and ContentDrafts
    const feedbacks = await prisma.feedback.findMany({
      where: {
        OR: [
          {
            ContentDraft: {
              organizationId: {
                in: organizationIds
              }
            }
          },
          {
            Idea: {
              organizationId: {
                in: organizationIds
              }
            }
          }
        ]
      },
      include: {
        User: {
          select: {
            name: true,
            email: true,
          },
        },
        ContentDraft: {
          include: {
            Idea: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        Idea: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Transform feedbacks to include target information
    const transformedFeedbacks = feedbacks.map(feedback => {
      // Determine if this feedback is for an Idea or ContentDraft
      const isIdeaFeedback = feedback.ideaId && feedback.Idea
      const isContentDraftFeedback = feedback.contentDraftId && feedback.ContentDraft
      
      return {
        id: feedback.id,
        comment: feedback.comment,
        rating: feedback.rating || 0,
        category: feedback.category || 'general',
        priority: feedback.priority || 'medium',
        actionable: feedback.actionable || false,
        createdAt: feedback.createdAt.toISOString(),
        createdBy: feedback.User,
        targetType: isIdeaFeedback ? 'idea' as const : 'content' as const,
        targetTitle: isIdeaFeedback 
          ? feedback.Idea?.title || 'Unknown Idea'
          : feedback.ContentDraft?.Idea?.title || 'Unknown Content',
        targetId: isIdeaFeedback 
          ? feedback.Idea?.id || ''
          : feedback.ContentDraft?.Idea?.id || '',
        feedbackType: isIdeaFeedback ? 'idea' : 'content',
        // Add the actual content draft or idea ID for navigation
        contentDraftId: feedback.contentDraftId,
        ideaId: feedback.ideaId
      }
    })

    // Calculate stats from actual feedback data
    const total = transformedFeedbacks.length
    const ratings = feedbacks.map(f => f.rating).filter(r => r > 0)
    const averageRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0
    const actionable = feedbacks.filter(f => f.actionable).length
    const highPriority = feedbacks.filter(f => f.priority === 'high').length
    
    // Group by category
    const byCategory = feedbacks.reduce((acc, feedback) => {
      const category = feedback.category || 'general'
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