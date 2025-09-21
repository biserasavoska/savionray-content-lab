import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requireOrganizationContext, createOrgFilter } from '@/lib/utils/organization-context'

type ContentType = 'NEWSLETTER' | 'BLOG_POST' | 'SOCIAL_MEDIA_POST' | 'WEBSITE_COPY' | 'EMAIL_CAMPAIGN'
type DeliveryPlanStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
type DeliveryItemStatus = 'PENDING' | 'IN_PROGRESS' | 'REVIEW' | 'APPROVED' | 'DELIVERED'

interface DeliveryItem {
  contentType: ContentType
  quantity: number
  dueDate: string
  priority: number
  notes?: string
}

interface CreateDeliveryPlanData {
  name: string
  description?: string
  startDate: string
  endDate: string
  targetMonth: string
  items: DeliveryItem[]
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get organization context for multi-tenant isolation
    const orgContext = await requireOrganizationContext(undefined, req);

    const data = (await req.json()) as CreateDeliveryPlanData

    // Convert targetMonth string (YYYY-MM) to a Date object
    const targetMonthDate = new Date(data.targetMonth + '-01')

    const plan = await prisma.$transaction(async (tx: any) => {
      const createdPlan = await tx.contentDeliveryPlan.create({
        data: {
          name: data.name,
          description: data.description,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          targetMonth: targetMonthDate,
          status: 'DRAFT' as DeliveryPlanStatus,
          clientId: session.user.id,
          organizationId: orgContext.organizationId, // Add organization isolation
        },
      })

      const items = await Promise.all(
        data.items.map((item) =>
          tx.contentDeliveryItem.create({
            data: {
              contentType: item.contentType,
              quantity: item.quantity,
              dueDate: new Date(item.dueDate),
              priority: item.priority,
              notes: item.notes,
              status: 'PENDING' as DeliveryItemStatus,
              planId: createdPlan.id,
              // Note: organizationId is inherited from the plan, not stored on items
            },
          })
        )
      )

      return {
        ...createdPlan,
        items,
      }
    })

    return NextResponse.json(plan)
  } catch (error) {
    console.error('Error creating delivery plan:', error)
    return NextResponse.json(
      { error: 'Failed to create delivery plan' },
      { status: 500 }
    )
  }
}

// Add GET endpoint to fetch plans with filtering by month
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get organization context for multi-tenant isolation
    const orgContext = await requireOrganizationContext(undefined, req);

    const url = new URL(req.url)
    const month = url.searchParams.get('month') // Format: YYYY-MM
    const showArchived = url.searchParams.get('showArchived') === 'true'

    // Create organization-aware filter
    const orgFilter = createOrgFilter(orgContext.organizationId);

    let where: any = {
      ...orgFilter, // Add organization filter
      clientId: session.user.id,
    }

    if (month) {
      const targetMonth = new Date(month + '-01')
      const nextMonth = new Date(targetMonth)
      nextMonth.setMonth(nextMonth.getMonth() + 1)

      where = {
        ...where,
        targetMonth: {
          gte: targetMonth,
          lt: nextMonth,
        },
      }
    }

    if (!showArchived) {
      where = {
        ...where,
        isArchived: false,
      }
    }

    const plans = await prisma.contentDeliveryPlan.findMany({
      where,
      include: {
        items: {
          include: {
            Idea: {
              include: {
                ContentDraft: {
                  orderBy: {
                    createdAt: 'desc',
                  },
                  take: 1,
                },
              },
            },
          },
        },
      },
      orderBy: [
        {
          targetMonth: 'desc',
        },
        {
          createdAt: 'desc',
        },
      ],
    })

    return NextResponse.json(plans)
  } catch (error) {
    console.error('Error fetching delivery plans:', error)
    return NextResponse.json(
      { error: 'Failed to fetch delivery plans' },
      { status: 500 }
    )
  }
} 