import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user with organization
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { organization: true }
    })

    if (!user?.organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30d'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Calculate date range
    let start: Date
    let end: Date = new Date()

    if (startDate && endDate) {
      start = new Date(startDate)
      end = new Date(endDate)
    } else {
      start = new Date()
      switch (period) {
        case '7d':
          start.setDate(start.getDate() - 7)
          break
        case '30d':
          start.setDate(start.getDate() - 30)
          break
        case '90d':
          start.setDate(start.getDate() - 90)
          break
        case '1y':
          start.setFullYear(start.getFullYear() - 1)
          break
        default:
          start.setDate(start.getDate() - 30)
      }
    }

    // Get current subscription and plan limits
    const subscription = await prisma.subscription.findFirst({
      where: { organizationId: user.organization.id },
      include: { plan: true },
      orderBy: { createdAt: 'desc' }
    })

    const limits = subscription?.plan || {
      contentItemsLimit: 100,
      aiGenerationsLimit: 1000,
      storageLimitGB: 10,
      teamMembersLimit: 3
    }

    // Get current usage metrics
    const [
      contentItemsCount,
      aiGenerationsCount,
      storageUsage,
      teamMembersCount
    ] = await Promise.all([
      // Content items created in the period
      prisma.idea.count({
        where: {
          organizationId: user.organization.id,
          createdAt: { gte: start, lte: end }
        }
      }),

      // AI generations (this would need to be tracked separately in a real app)
      prisma.contentDraft.count({
        where: {
          idea: {
            organizationId: user.organization.id
          },
          createdAt: { gte: start, lte: end },
          metadata: {
            path: ['aiGenerated'],
            equals: true
          }
        }
      }),

      // Storage usage (this would need to be calculated from actual file sizes)
      prisma.idea.aggregate({
        where: {
          organizationId: user.organization.id,
          createdAt: { gte: start, lte: end }
        },
        _sum: {
          // This is a placeholder - in real app, you'd track actual file sizes
          // For now, we'll estimate based on content length
        }
      }),

      // Team members count
      prisma.user.count({
        where: {
          organizationId: user.organization.id
        }
      })
    ])

    // Get historical data for charts
    const historicalData = await getHistoricalUsageData(user.organization.id, start, end)

    // Calculate storage usage (mock calculation)
    const estimatedStorageGB = Math.round((contentItemsCount * 0.1) * 100) / 100 // 0.1GB per content item

    const currentUsage = {
      contentItems: contentItemsCount,
      contentItemsLimit: limits.contentItemsLimit,
      aiGenerations: aiGenerationsCount,
      aiGenerationsLimit: limits.aiGenerationsLimit,
      storageGB: estimatedStorageGB,
      storageLimitGB: limits.storageLimitGB,
      teamMembers: teamMembersCount,
      teamMembersLimit: limits.teamMembersLimit
    }

    return NextResponse.json({
      currentUsage,
      historicalData,
      period,
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString()
      }
    })
  } catch (error) {
    console.error('Error fetching usage data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch usage data' },
      { status: 500 }
    )
  }
}

async function getHistoricalUsageData(organizationId: string, start: Date, end: Date) {
  // Generate date points for the chart
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  const data = []

  for (let i = 0; i <= Math.min(days, 30); i++) { // Limit to 30 data points
    const date = new Date(start)
    date.setDate(date.getDate() + i)
    
    const nextDate = new Date(date)
    nextDate.setDate(nextDate.getDate() + 1)

    // Get content items for this day
    const contentItems = await prisma.idea.count({
      where: {
        organizationId,
        createdAt: { gte: date, lt: nextDate }
      }
    })

    // Get AI generations for this day
    const aiGenerations = await prisma.contentDraft.count({
      where: {
        idea: {
          organizationId
        },
        createdAt: { gte: date, lt: nextDate },
        metadata: {
          path: ['aiGenerated'],
          equals: true
        }
      }
    })

    data.push({
      period: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      contentItems,
      aiGenerations,
      storageGB: Math.round((contentItems * 0.1) * 100) / 100,
      teamMembers: 0 // This would be constant, so we'll set it to 0 for the chart
    })
  }

  return data
} 