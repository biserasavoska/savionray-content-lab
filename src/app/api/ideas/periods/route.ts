import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireOrganizationContext } from '@/lib/utils/organization-context';

export async function GET(request: NextRequest) {
  try {
    // Check for organization in headers first (from client selection)
    const selectedOrgId = request.headers.get('x-selected-organization');
    console.log('Ideas Periods API - Selected org from header:', selectedOrgId);
    
    const context = await requireOrganizationContext(selectedOrgId || undefined, request);
    console.log('Ideas Periods API - Organization context:', {
      organizationId: context.organizationId,
      userId: context.userId,
      userEmail: context.userEmail
    });
    
    // Get all unique months/years from ideas with publishingDateTime
    const ideasWithPublishingDates = await prisma.idea.findMany({
      where: {
        organizationId: context.organizationId,
        publishingDateTime: {
          not: null
        }
      },
      select: {
        publishingDateTime: true
      },
      orderBy: {
        publishingDateTime: 'desc'
      }
    });

    // Extract unique months and format them
    const periods = new Set<string>();
    const periodDetails: Array<{ value: string; label: string; count: number }> = [];
    
    ideasWithPublishingDates.forEach(idea => {
      if (idea.publishingDateTime) {
        const date = new Date(idea.publishingDateTime);
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // getMonth() is 0-indexed
        const periodKey = `${year}-${month.toString().padStart(2, '0')}`;
        periods.add(periodKey);
      }
    });

    // Count ideas for each period and create period details
    for (const period of periods) {
      const [year, month] = period.split('-').map(Number);
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
      
      const count = await prisma.idea.count({
        where: {
          organizationId: context.organizationId,
          publishingDateTime: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        }
      });

      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];

      periodDetails.push({
        value: period,
        label: `${monthNames[month - 1]} ${year}`,
        count
      });
    }

    // Sort by period (newest first)
    periodDetails.sort((a, b) => b.value.localeCompare(a.value));

    // Get the latest period (most recent month with ideas)
    const latestPeriod = periodDetails.length > 0 ? periodDetails[0].value : null;

    return NextResponse.json({
      periods: periodDetails,
      latestPeriod
    });
  } catch (error) {
    console.error('Error fetching idea periods:', error);
    return NextResponse.json(
      { error: 'Failed to fetch idea periods' },
      { status: 500 }
    );
  }
}
