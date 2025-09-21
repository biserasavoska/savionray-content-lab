import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requireOrganizationContext } from '@/lib/utils/organization-context'

interface UpdateDeliveryPlanData {
  name: string
  description?: string
  startDate: string
  endDate: string
  targetMonth: string
  items: Array<{
    id?: string
    contentType: string
    quantity: number
    dueDate: string
    priority: number
    notes?: string
  }>
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const orgContext = await requireOrganizationContext(undefined, req)
    const data = (await req.json()) as UpdateDeliveryPlanData

    // Check if the plan exists and belongs to the user's organization
    const existingPlan = await prisma.contentDeliveryPlan.findUnique({
      where: { id: params.id },
      include: { items: true }
    })

    if (!existingPlan) {
      return NextResponse.json({ error: 'Delivery plan not found' }, { status: 404 })
    }

    if (existingPlan.organizationId !== orgContext.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const targetMonthDate = new Date(data.targetMonth + '-01')

    const updatedPlan = await prisma.$transaction(async (tx: any) => {
      // Update the plan
      const plan = await tx.contentDeliveryPlan.update({
        where: { id: params.id },
        data: {
          name: data.name,
          description: data.description,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          targetMonth: targetMonthDate,
        },
      })

      // Delete existing items
      await tx.contentDeliveryItem.deleteMany({
        where: { planId: params.id }
      })

      // Create new items
      const items = await Promise.all(
        data.items.map((item) =>
          tx.contentDeliveryItem.create({
            data: {
              contentType: item.contentType,
              quantity: item.quantity,
              dueDate: new Date(item.dueDate),
              priority: item.priority,
              notes: item.notes,
              status: 'PENDING',
              planId: params.id,
            },
          })
        )
      )

      return {
        ...plan,
        items,
      }
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const orgContext = await requireOrganizationContext(undefined, req)

    // Check if the plan exists and belongs to the user's organization
    const existingPlan = await prisma.contentDeliveryPlan.findUnique({
      where: { id: params.id }
    })

    if (!existingPlan) {
      return NextResponse.json({ error: 'Delivery plan not found' }, { status: 404 })
    }

    if (existingPlan.organizationId !== orgContext.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Delete the plan (items will be deleted automatically due to cascade)
    await prisma.contentDeliveryPlan.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting delivery plan:', error)
    return NextResponse.json(
      { error: 'Failed to delete delivery plan' },
      { status: 500 }
    )
  }
}