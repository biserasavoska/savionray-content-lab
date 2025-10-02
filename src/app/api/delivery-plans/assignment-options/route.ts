import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { requireOrganizationContext } from '@/lib/utils/organization-context';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get organization context for multi-tenant isolation
    const orgContext = await requireOrganizationContext(undefined, req);

    const url = new URL(req.url);
    const contentType = url.searchParams.get('contentType');

    // Build where clause for delivery plans
    const where: any = {
      organizationId: orgContext.organizationId,
      isArchived: false,
      status: {
        in: ['DRAFT', 'ACTIVE'],
      },
      // If content type is specified, only show plans that have items of that type
      ...(contentType && {
        items: {
          some: {
            contentType: contentType,
          },
        },
      }),
    };

    const deliveryPlans = await prisma.contentDeliveryPlan.findMany({
      where,
      include: {
        items: {
          where: contentType ? { contentType: contentType as any } : undefined,
          select: {
            id: true,
            contentType: true,
            quantity: true,
            status: true,
            Idea: {
              select: {
                id: true,
              },
            },
          },
        },
        client: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        targetMonth: 'desc',
      },
    });

    // Transform the data to include available slots per content type
    const plansWithSlots = deliveryPlans.map(plan => {
      const itemsByType = plan.items.reduce((acc: any, item: any) => {
        const assignedCount = item.Idea.length;
        const availableSlots = item.quantity - assignedCount;
        
        if (!acc[item.contentType]) {
          acc[item.contentType] = {
            total: 0,
            assigned: 0,
            available: 0,
            items: [],
          };
        }
        
        acc[item.contentType].total += item.quantity;
        acc[item.contentType].assigned += assignedCount;
        acc[item.contentType].available += availableSlots;
        acc[item.contentType].items.push({
          id: item.id,
          quantity: item.quantity,
          status: item.status,
          assignedCount,
          availableSlots,
        });
        
        return acc;
      }, {} as any);

      return {
        id: plan.id,
        name: plan.name,
        description: plan.description,
        targetMonth: plan.targetMonth,
        status: plan.status,
        client: plan.client,
        itemsByType,
        totalItems: plan.items.length,
      };
    });

    return NextResponse.json({
      deliveryPlans: plansWithSlots,
      totalCount: plansWithSlots.length,
    });
  } catch (error) {
    console.error('Error fetching delivery plans for assignment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch delivery plans' },
      { status: 500 }
    );
  }
}
