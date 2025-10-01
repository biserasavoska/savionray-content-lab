import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { requireOrganizationContext } from '@/lib/utils/organization-context';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get organization context for multi-tenant isolation
    const orgContext = await requireOrganizationContext(undefined, req);

    const body = await req.json();
    const { ideaIds } = body;

    if (!ideaIds || !Array.isArray(ideaIds) || ideaIds.length === 0) {
      return NextResponse.json(
        { error: 'ideaIds array is required and must not be empty' },
        { status: 400 }
      );
    }

    // Verify the delivery item exists and belongs to the user's organization
    const deliveryItem = await prisma.contentDeliveryItem.findFirst({
      where: {
        id: params.id,
        plan: {
          organizationId: orgContext.organizationId,
        },
      },
      include: {
        plan: true,
      },
    });

    if (!deliveryItem) {
      return NextResponse.json(
        { error: 'Delivery item not found' },
        { status: 404 }
      );
    }

    // Verify all ideas exist and belong to the organization
    const ideas = await prisma.idea.findMany({
      where: {
        id: { in: ideaIds },
        organizationId: orgContext.organizationId,
      },
    });

    if (ideas.length !== ideaIds.length) {
      return NextResponse.json(
        { error: 'One or more ideas not found or do not belong to your organization' },
        { status: 404 }
      );
    }

    // Check if any ideas are already assigned to a delivery item
    const alreadyAssigned = ideas.filter(idea => idea.deliveryItemId !== null);
    if (alreadyAssigned.length > 0) {
      return NextResponse.json(
        {
          error: 'Some ideas are already assigned to delivery items',
          alreadyAssignedIds: alreadyAssigned.map(idea => idea.id),
        },
        { status: 400 }
      );
    }

    // Assign all ideas to the delivery item
    await prisma.idea.updateMany({
      where: {
        id: { in: ideaIds },
        organizationId: orgContext.organizationId,
      },
      data: {
        deliveryItemId: params.id,
      },
    });

    // Fetch updated delivery item with assigned ideas
    const updatedDeliveryItem = await prisma.contentDeliveryItem.findUnique({
      where: { id: params.id },
      include: {
        Idea: {
          include: {
            User: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      assignedCount: ideaIds.length,
      deliveryItem: updatedDeliveryItem,
    });
  } catch (error) {
    console.error('Error assigning ideas to delivery item:', error);
    return NextResponse.json(
      { error: 'Failed to assign ideas to delivery item' },
      { status: 500 }
    );
  }
}

