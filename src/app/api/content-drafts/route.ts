import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireOrganizationContext } from '@/lib/utils/organization-context';
import { getServerSession } from 'next-auth';
import { authOptions, isAdmin, isCreative } from '@/lib/auth';
import { IDEA_STATUS, DRAFT_STATUS } from '@/lib/utils/enum-utils';

export async function GET(request: NextRequest) {
  try {
    // Check for organization in headers first (from client selection)
    const selectedOrgId = request.headers.get('x-selected-organization');
    console.log('Content Drafts API - Selected org from header:', selectedOrgId);
    
    const context = await requireOrganizationContext(selectedOrgId || undefined, request);
    console.log('Content Drafts API - Organization context:', {
      organizationId: context.organizationId,
      userId: context.userId,
      userEmail: context.userEmail
    });
    
    // Get user session to determine role-based filtering
    const session = await getServerSession(authOptions);
    const isUserCreative = session ? isCreative(session) : false;
    const isUserAdmin = session ? isAdmin(session) : false;
    const isUserClient = session?.user?.role === 'CLIENT';
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const period = searchParams.get('period'); // Format: "October" or "October 2024"
    
    const skip = (page - 1) * limit;
    
    const where: any = {
      organizationId: context.organizationId,
      // Remove Idea status restriction to show all drafts
    };
    
    // Filter by status if provided
    if (status) {
      where.status = status;
    } else {
      // Role-based default filter
      if (isUserClient) {
        // Client users: exclude DRAFT status (only show submitted content)
        where.status = {
          in: [
            DRAFT_STATUS.AWAITING_FEEDBACK, 
            DRAFT_STATUS.AWAITING_REVISION, 
            DRAFT_STATUS.APPROVED, 
            DRAFT_STATUS.REJECTED
          ]
        };
      } else {
        // Creative/Admin users: show all statuses including drafts
        where.status = {
          in: [
            DRAFT_STATUS.DRAFT, 
            DRAFT_STATUS.AWAITING_FEEDBACK, 
            DRAFT_STATUS.AWAITING_REVISION, 
            DRAFT_STATUS.APPROVED, 
            DRAFT_STATUS.REJECTED
          ]
        };
      }
    }

    // Apply period filter if provided
    if (period && period !== 'ALL') {
      const currentYear = new Date().getFullYear();
      const parts = period.split(' ');
      const monthName = parts[0];
      const year = parts.length > 1 ? parseInt(parts[1]) : currentYear;
      
      // Create date range for the month
      const startDate = new Date(year, new Date(`${monthName} 1, ${year}`).getMonth(), 1);
      const endDate = new Date(year, new Date(`${monthName} 1, ${year}`).getMonth() + 1, 0, 23, 59, 59);
      
      where.Idea = {
        publishingDateTime: {
          gte: startDate,
          lte: endDate
        }
      };
    }
    
    const [drafts, total] = await Promise.all([
      prisma.contentDraft.findMany({
        where,
        orderBy: {
          updatedAt: 'desc'
        },
        skip,
        take: limit,
        include: {
          Idea: {
            include: {
              User: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                  image: true
                },
              },
            },
          },
          User: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              image: true
            },
          },
          Feedback: {
            include: {
              User: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            }
          }
        },
      }),
      prisma.contentDraft.count({ where }),
    ]);
    
    const totalPages = Math.ceil(total / limit);
    
    return NextResponse.json({
      drafts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching content drafts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content drafts' },
      { status: 500 }
    );
  }
}
