import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requireOrganizationContext } from '@/lib/utils/organization-context'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const orgContext = await requireOrganizationContext(undefined, req);
    if (!orgContext) {
      return NextResponse.json({ error: 'Organization context required' }, { status: 400 })
    }

    // Ensure the plan belongs to the selected organization
    const existingPlan = await prisma.contentDeliveryPlan.findUnique({
      where: { id: params.id },
      select: { organizationId: true }
    });

    if (!existingPlan || existingPlan.organizationId !== orgContext.organizationId) {
      return NextResponse.json({ error: 'Unauthorized to update this plan' }, { status: 403 })
    }

    const { isArchived } = await req.json()

    const updatedPlan = await prisma.contentDeliveryPlan.update({
      where: { id: params.id },
      data: { isArchived },
      include: {
        client: {
          select: {
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            Idea: {
              include: {
                ContentDraft: true,
              },
            },
            ContentItem: {
              select: {
                id: true,
                status: true,
                currentStage: true,
                publishedAt: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        },
        organization: {
          select: {
            name: true,
            primaryColor: true,
          },
        },
      },
    })

    return NextResponse.json(updatedPlan)
  } catch (error) {
    console.error('Error updating delivery plan archive status:', error)
    return NextResponse.json(
      { error: 'Failed to update delivery plan archive status' },
      { status: 500 }
    )
  }
}
