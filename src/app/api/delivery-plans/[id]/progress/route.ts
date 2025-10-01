import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireOrganizationContext } from '@/lib/utils/organization-context';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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

    // Get the delivery plan
    const deliveryPlan = await prisma.deliveryPlan.findFirst({
      where: {
        id: params.id,
        organizationId: orgContext.organizationId,
      },
      include: {
        items: {
          include: {
            idea: true,
            contentDrafts: {
              where: {
                organizationId: orgContext.organizationId,
              },
            },
          },
        },
      },
    });

    if (!deliveryPlan) {
      return NextResponse.json({ error: 'Delivery plan not found' }, { status: 404 });
    }

    // Calculate progress for each stage
    const totalItems = deliveryPlan.items.length;
    const ideasCount = deliveryPlan.items.filter(item => item.idea).length;
    const draftsCount = deliveryPlan.items.filter(item => 
      item.contentDrafts.some(draft => draft.status === 'DRAFT')
    ).length;
    const approvedCount = deliveryPlan.items.filter(item => 
      item.contentDrafts.some(draft => draft.status === 'APPROVED')
    ).length;
    const deliveredCount = deliveryPlan.items.filter(item => 
      item.contentDrafts.some(draft => draft.status === 'DELIVERED')
    ).length;

    // Calculate overall progress percentage
    const progressPercentage = totalItems > 0 ? Math.round((deliveredCount / totalItems) * 100) : 0;

    // Determine status
    let status = 'NOT_STARTED';
    if (deliveredCount === totalItems && totalItems > 0) {
      status = 'COMPLETED';
    } else if (progressPercentage >= 80) {
      status = 'ON_TRACK';
    } else if (progressPercentage > 0) {
      status = 'BEHIND_SCHEDULE';
    }

    const progress = {
      totalItems,
      ideasCount,
      draftsCount,
      approvedCount,
      deliveredCount,
      progressPercentage,
      status,
      deliveryPlan: {
        id: deliveryPlan.id,
        name: deliveryPlan.name,
        targetMonth: deliveryPlan.targetMonth,
        status: deliveryPlan.status,
      },
    };

    return NextResponse.json({ progress });
  } catch (error) {
    console.error('Error fetching delivery plan progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch delivery plan progress' },
      { status: 500 }
    );
  }
}
