import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { requireOrganizationContext } from '@/lib/utils/organization-context';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('Suggestions API: Starting request for delivery item:', params.id);
  
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    console.log('Suggestions API: No session found');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('Suggestions API: Getting organization context');
    // Get organization context for multi-tenant isolation
    const orgContext = await requireOrganizationContext(undefined, req);
    console.log('Suggestions API: Organization context:', orgContext);

    // Get the delivery item and its plan
    console.log('Suggestions API: Looking for delivery item:', params.id, 'in org:', orgContext.organizationId);
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

    console.log('Suggestions API: Found delivery item:', deliveryItem ? 'YES' : 'NO');
    if (!deliveryItem) {
      console.log('Suggestions API: Delivery item not found for ID:', params.id);
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
    // 1. Same organization (verified by orgContext - plan must belong to this org)
    // 2. Same content type
    // 3. Publishing date within the plan's target month
    // 4. Not already assigned to any delivery item
    // 5. Status is PENDING
    const suggestions = await prisma.idea.findMany({
      where: {
        organizationId: orgContext.organizationId,
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

    console.log('Suggestions API: Found', suggestions.length, 'suggestions');
    const response = {
      suggestions,
      matchCriteria: {
        contentType: deliveryItem.contentType,
        period: targetMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        totalMatches: suggestions.length,
        deliveryItemId: deliveryItem.id,
        deliveryItemName: `${deliveryItem.contentType} (${deliveryItem.quantity} items)`,
      },
    };
    console.log('Suggestions API: Returning response:', response);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Suggestions API: Error fetching suggestions for delivery item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suggestions' },
      { status: 500 }
    );
  }
}

