import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, isAdmin, isCreative } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requireOrganizationContext } from '@/lib/utils/organization-context';
import { DRAFT_STATUS } from '@/lib/utils/enum-utils';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get organization context from header
    const context = await requireOrganizationContext(undefined, request);
    if (!context) {
      return NextResponse.json({ error: 'Organization context not found' }, { status: 400 });
    }

    // Determine user role for filtering
    const isUserClient = session?.user?.role === 'CLIENT';
    
    // Apply role-based status filtering
    const statusFilter = isUserClient
      ? [
          DRAFT_STATUS.AWAITING_FEEDBACK,
          DRAFT_STATUS.AWAITING_REVISION,
          DRAFT_STATUS.APPROVED,
          DRAFT_STATUS.REJECTED
        ]
      : [
          DRAFT_STATUS.DRAFT,
          DRAFT_STATUS.AWAITING_FEEDBACK,
          DRAFT_STATUS.AWAITING_REVISION,
          DRAFT_STATUS.APPROVED,
          DRAFT_STATUS.REJECTED
        ];

    // Get all content drafts with their associated ideas' publishing dates
    const drafts = await prisma.contentDraft.findMany({
      where: {
        organizationId: context.organizationId,
        status: {
          in: statusFilter
        }
      },
      include: {
        Idea: {
          select: {
            publishingDateTime: true
          }
        }
      }
    });

    // Extract unique months from publishing dates
    const periods = new Set<string>();
    const currentYear = new Date().getFullYear();
    
    drafts.forEach(draft => {
      if (draft.Idea?.publishingDateTime) {
        const date = new Date(draft.Idea.publishingDateTime);
        const year = date.getFullYear();
        const month = date.getMonth();
        
        // Format as "October" for current year, "October 2024" for other years
        const monthName = date.toLocaleDateString('en-US', { month: 'long' });
        const periodKey = year === currentYear ? monthName : `${monthName} ${year}`;
        
        periods.add(periodKey);
      }
    });

    // Convert to array and sort by date (most recent first)
    const sortedPeriods = Array.from(periods).sort((a, b) => {
      // Parse the period strings back to dates for sorting
      const parsePeriod = (period: string) => {
        const parts = period.split(' ');
        const monthName = parts[0];
        const year = parts.length > 1 ? parseInt(parts[1]) : currentYear;
        const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();
        return new Date(year, monthIndex);
      };
      
      return parsePeriod(b).getTime() - parsePeriod(a).getTime();
    });

    console.log('Ready Content Periods API - Returning periods:', sortedPeriods);
    return NextResponse.json({ periods: sortedPeriods });
  } catch (error) {
    console.error('Error fetching ready content periods:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ready content periods' },
      { status: 500 }
    );
  }
}
