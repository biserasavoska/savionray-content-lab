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
    const period = url.searchParams.get('period'); // Format: "October 2025"
    const contentType = url.searchParams.get('contentType');
    const search = url.searchParams.get('search');

    const where: any = {
      organizationId: orgContext.organizationId,
      deliveryItemId: null, // Only unassigned ideas
      status: 'PENDING',
    };

    // Apply content type filter
    if (contentType && contentType !== 'ALL') {
      where.contentType = contentType;
    }

    // Apply period filter
    if (period && period !== 'ALL') {
      const currentYear = new Date().getFullYear();
      const parts = period.split(' ');
      const monthName = parts[0];
      const year = parts.length > 1 ? parseInt(parts[1]) : currentYear;
      
      // Create date range for the month
      const startDate = new Date(year, new Date(`${monthName} 1, ${year}`).getMonth(), 1);
      const endDate = new Date(year, new Date(`${monthName} 1, ${year}`).getMonth() + 1, 0, 23, 59, 59);
      
      where.publishingDateTime = {
        gte: startDate,
        lte: endDate,
      };
    }

    // Apply search filter
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const ideas = await prisma.idea.findMany({
      where,
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

    const totalCount = await prisma.idea.count({ where });

    return NextResponse.json({
      ideas,
      totalCount,
      filters: {
        period,
        contentType,
        search,
      },
    });
  } catch (error) {
    console.error('Error fetching unassigned ideas:', error);
    return NextResponse.json(
      { error: 'Failed to fetch unassigned ideas' },
      { status: 500 }
    );
  }
}

