import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireOrganizationContext } from '@/lib/utils/organization-context';
import { getServerSession } from 'next-auth';
import { authOptions, isCreative, isAdmin } from '@/lib/auth';
import { DRAFT_STATUS } from '@/lib/utils/enum-utils';

export async function GET(request: NextRequest) {
  try {
    // Check for organization in headers first (from client selection)
    const selectedOrgId = request.headers.get('x-selected-organization');
    console.log('Content Drafts Periods API - Selected org from header:', selectedOrgId);
    
    const context = await requireOrganizationContext(selectedOrgId || undefined, request);
    console.log('Content Drafts Periods API - Organization context:', {
      organizationId: context.organizationId,
      userId: context.userId,
      userEmail: context.userEmail
    });
    
    // Get user session to determine role-based filtering
    const session = await getServerSession(authOptions);
    const isUserClient = session?.user?.role === 'CLIENT';
    
    // Role-based status filter
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

    // Extract unique months from publishing dates (or fallback to draft dates)
    const periods = new Set<string>();
    const currentYear = new Date().getFullYear();
    
    drafts.forEach(draft => {
      // Try to use Idea's publishingDateTime first, otherwise use draft's createdAt
      let dateToUse: Date | null = null;
      
      if (draft.Idea?.publishingDateTime) {
        dateToUse = new Date(draft.Idea.publishingDateTime);
      } else if (draft.createdAt) {
        // Fallback to draft creation date if no Idea publishing date
        dateToUse = new Date(draft.createdAt);
      }
      
      if (dateToUse) {
        const year = dateToUse.getFullYear();
        const month = dateToUse.getMonth();
        
        // Format as "October" for current year, "October 2024" for other years
        const monthName = dateToUse.toLocaleDateString('en-US', { month: 'long' });
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

    console.log('Content Drafts Periods API - Returning periods:', sortedPeriods);
    return NextResponse.json({ periods: sortedPeriods });
  } catch (error) {
    console.error('Error fetching content drafts periods:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content drafts periods' },
      { status: 500 }
    );
  }
}
