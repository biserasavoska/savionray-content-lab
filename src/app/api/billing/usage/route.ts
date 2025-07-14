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

    // Get user with organization through OrganizationUser
    const userWithOrg = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { 
        organizationUsers: {
          include: {
            organization: true
          }
        }
      }
    })

    if (!userWithOrg?.organizationUsers?.[0]?.organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    const organization = userWithOrg.organizationUsers[0].organization

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

    // Get current subscription plan details
    const plan = await prisma.subscriptionPlan.findFirst({
      where: { 
        name: organization.subscriptionPlan,
        isActive: true
      }
    })

    const limits = {
      contentItemsLimit: 100, // Default limits
      aiGenerationsLimit: 1000,
      storageLimitGB: organization.maxStorageGB,
      teamMembersLimit: organization.maxUsers
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
          organizationId: organization.id,
          createdAt: { gte: start, lte: end }
        }
      }),

      // AI generations (this would need to be tracked separately in a real app)
      prisma.contentDraft.count({
        where: {
          idea: {
            organizationId: organization.id
          },
          createdAt: { gte: start, lte: end },
          metadata: {
            path: ['aiGenerated'],
            equals: true
          }
        }
      }),

      // Storage usage (this would need to be calculated from actual file sizes)
      prisma.media.aggregate({
        where: {
          organizationId: organization.id,
          createdAt: { gte: start, lte: end }
        },
        _sum: {
          size: true
        }
      }),

      // Team members count
      prisma.organizationUser.count({
        where: {
          organizationId: organization.id,
          isActive: true
        }
      })
    ])

    // Get historical data for charts
    const historicalData = await getHistoricalUsageData(organization.id, start, end)

    // Calculate storage usage (convert bytes to GB)
    const storageBytes = storageUsage._sum.size || 0
    const estimatedStorageGB = Math.round((storageBytes / (1024 * 1024 * 1024)) * 100) / 100

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

    // Get storage usage for this day
    const storageUsage = await prisma.media.aggregate({
      where: {
        organizationId,
        createdAt: { gte: date, lt: nextDate }
      },
      _sum: {
        size: true
      }
    })

    const storageGB = Math.round(((storageUsage._sum.size || 0) / (1024 * 1024 * 1024)) * 100) / 100

    data.push({
      period: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      contentItems,
      aiGenerations,
      storageGB,
      teamMembers: 0 // This would be constant, so we'll set it to 0 for the chart
    })
  }

  return data
} 