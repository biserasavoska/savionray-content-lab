import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireOrganizationContext } from '@/lib/utils/organization-context';
import { getServerSession } from 'next-auth';
import { authOptions, isAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Check for organization in headers first (from client selection)
    const selectedOrgId = request.headers.get('x-selected-organization');
    console.log('Ideas API - Selected org from header:', selectedOrgId);
    
    const context = await requireOrganizationContext(selectedOrgId || undefined, request);
    console.log('Ideas API - Organization context:', {
      organizationId: context.organizationId,
      userId: context.userId,
      userEmail: context.userEmail
    });
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const contentType = searchParams.get('contentType');
    
    const skip = (page - 1) * limit;
    
    const where: any = {
      organizationId: context.organizationId,
    };
    
    // Apply status filter
    if (status && status !== 'ALL') {
      where.status = status;
    }
    // If status is 'ALL' or not provided, show all statuses (no status filter)
    
    // Apply content type filter
    if (contentType && contentType !== 'ALL') {
      where.contentType = contentType;
    }
    // If contentType is 'ALL' or not provided, show all content types (no content type filter)
    
    const [ideas, total] = await Promise.all([
      prisma.idea.findMany({
        where,
        orderBy: [
          { publishingDateTime: 'asc' },
          { createdAt: 'asc' }  // Fallback for ideas without publish date
        ],
        skip,
        take: limit,
        include: {
          User: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.idea.count({ where }),
    ]);
    
    const totalPages = Math.ceil(total / limit);
    
    return NextResponse.json({
      ideas,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching ideas:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ideas' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { title, description, contentType, mediaType, publishingDateTime, organizationId } = body;
    
    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    // Get session to check if user is admin
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    let targetOrganizationId: string;
    let createdById: string;

    if (isAdmin(session) && organizationId) {
      // Admin user creating idea for specific organization
      // Validate that the admin has access to this organization
      const adminOrgAccess = await prisma.organizationUser.findFirst({
        where: {
          userId: session.user.id,
          organizationId: organizationId,
          isActive: true,
        },
      });

      if (!adminOrgAccess) {
        return NextResponse.json(
          { error: 'You do not have access to this organization' },
          { status: 403 }
        );
      }

      targetOrganizationId = organizationId;
      createdById = session.user.id;
    } else {
      // Regular user or admin without specific organization - use context
      const context = await requireOrganizationContext(undefined, request);
      targetOrganizationId = context.organizationId;
      createdById = context.userId;
    }
    
    // Map form values to Prisma enum values
    const mapContentType = (type: string) => {
      switch (type) {
        case 'social-media': return 'SOCIAL_MEDIA_POST';
        case 'newsletter': return 'NEWSLETTER';
        case 'blog-post': return 'BLOG_POST';
        case 'website-copy': return 'WEBSITE_COPY';
        case 'email-campaign': return 'EMAIL_CAMPAIGN';
        default: return 'SOCIAL_MEDIA_POST';
      }
    };

    const mapMediaType = (type: string) => {
      switch (type) {
        case 'image': return 'PHOTO';
        case 'video': return 'VIDEO';
        case 'infographic': return 'GRAPH_OR_INFOGRAPHIC';
        case 'social-card': return 'SOCIAL_CARD';
        case 'poll': return 'POLL';
        case 'carousel': return 'CAROUSEL';
        default: return 'SOCIAL_CARD';
      }
    };

    const idea = await prisma.idea.create({
      data: {
        title,
        description,
        contentType: mapContentType(contentType),
        mediaType: mapMediaType(mediaType),
        publishingDateTime: publishingDateTime ? new Date(publishingDateTime) : null,
        status: 'PENDING',
        createdById: createdById,
        organizationId: targetOrganizationId,
      },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    
    return NextResponse.json(idea, { status: 201 });
  } catch (error) {
    console.error('Error creating idea:', error);
    return NextResponse.json(
      { error: 'Failed to create idea' },
      { status: 500 }
    );
  }
}
