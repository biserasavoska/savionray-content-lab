import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireOrganizationContext } from '@/lib/utils/organization-context';
import { getServerSession } from 'next-auth';
import { authOptions, isAdmin } from '@/lib/auth';
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
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    
    const skip = (page - 1) * limit;
    
    const where: any = {
      organizationId: context.organizationId,
      Idea: {
        status: IDEA_STATUS.APPROVED
      },
    };
    
    // Filter by status if provided
    if (status) {
      where.status = status;
    } else {
      // Default filter: show drafts that need review
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
