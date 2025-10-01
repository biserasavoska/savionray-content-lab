import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { requireOrganizationContext } from '@/lib/utils/organization-context';

export async function GET(
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

    // Get the delivery item and its plan
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

    // Calculate the date range for the target month
    const targetMonth = new Date(deliveryItem.plan.targetMonth);
    const startDate = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
    const endDate = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0, 23, 59, 59);

    // Find unassigned ideas that match:
    // 1. Same organization as the delivery plan
    // 2. Same content type
    // 3. Publishing date within the plan's target month
    // 4. Not already assigned to any delivery item
    // 5. Status is PENDING
    const suggestions = await prisma.idea.findMany({
      where: {
        organizationId: deliveryItem.plan.organizationId,
        deliveryItemId: null,
        contentType: deliveryItem.contentType,
        publishingDateTime: {
          gte: startDate,
          lte: endDate,
        },
        status: 'PENDING',
      },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        ContentDraft: {
          select: {
            id: true,
            status: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        publishingDateTime: 'asc',
      },
    });

    return NextResponse.json({
      suggestions,
      matchCriteria: {
        contentType: deliveryItem.contentType,
        period: targetMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        totalMatches: suggestions.length,
        deliveryItemId: deliveryItem.id,
        deliveryItemName: `${deliveryItem.contentType} (${deliveryItem.quantity} items)`,
      },
    });
  } catch (error) {
    console.error('Error fetching suggestions for delivery item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suggestions' },
      { status: 500 }
    );
  }
}

