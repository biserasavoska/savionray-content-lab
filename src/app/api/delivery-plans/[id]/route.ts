import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { DeliveryPlanStatus } from '@prisma/client'

import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await req.json()
    const { status } = data

    // Verify the plan exists and belongs to the user
    const plan = await prisma.contentDeliveryPlan.findUnique({
      where: { id: params.id },
    })

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    if (plan.clientId !== session.user.id) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Update the plan status
    const updatedPlan = await prisma.contentDeliveryPlan.update({
      where: { id: params.id },
      data: {
        status: status as DeliveryPlanStatus,
      },
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
    })

    return NextResponse.json(updatedPlan)
  } catch (error) {
    console.error('Error updating delivery plan:', error)
    return NextResponse.json(
      { error: 'Failed to update delivery plan' },
      { status: 500 }
    )
  }
} 