import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { requireOrganizationContext } from '@/lib/utils/organization-context';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; ideaId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get organization context for multi-tenant isolation
    const orgContext = await requireOrganizationContext(undefined, req);

    // Verify the delivery item exists and belongs to the user's organization
    const deliveryItem = await prisma.contentDeliveryItem.findFirst({
      where: {
        id: params.id,
        plan: {
          organizationId: orgContext.organizationId,
        },
      },
    });

    if (!deliveryItem) {
      return NextResponse.json(
        { error: 'Delivery item not found' },
        { status: 404 }
      );
    }

    // Verify the idea exists, belongs to the organization, and is assigned to this delivery item
    const idea = await prisma.idea.findFirst({
      where: {
        id: params.ideaId,
        organizationId: orgContext.organizationId,
        deliveryItemId: params.id,
      },
    });

    if (!idea) {
      return NextResponse.json(
        { error: 'Idea not found or not assigned to this delivery item' },
        { status: 404 }
      );
    }

    // Unassign the idea
    const updatedIdea = await prisma.idea.update({
      where: { id: params.ideaId },
      data: { deliveryItemId: null },
      include: {
        User: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      idea: updatedIdea,
    });
  } catch (error) {
    console.error('Error unassigning idea from delivery item:', error);
    return NextResponse.json(
      { error: 'Failed to unassign idea from delivery item' },
      { status: 500 }
    );
  }
}

