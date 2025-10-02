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
    const period = searchParams.get('period'); // Format: "2025-10" for October 2025
    
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
    
    // Apply period filter (filter by publishingDateTime month/year)
    if (period && period !== 'ALL') {
      // Parse period format "2025-10" to get year and month
      const [year, month] = period.split('-').map(Number);
      if (year && month) {
        const startOfMonth = new Date(year, month - 1, 1); // month is 0-indexed in Date constructor
        const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999); // Last day of the month
        
        where.publishingDateTime = {
          gte: startOfMonth,
          lte: endOfMonth
        };
      }
    }
    // If period is 'ALL' or not provided, show all periods (no period filter)
    
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
    
    const { title, description, contentType, mediaType, publishingDateTime, organizationId, deliveryItemId } = body;
    
    console.log('Idea creation request:', {
      title,
      contentType,
      mediaType,
      publishingDateTime,
      organizationId,
      deliveryItemId
    });
    
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

    // Validate delivery item assignment if provided
    if (deliveryItemId) {
      const deliveryItem = await prisma.contentDeliveryItem.findFirst({
        where: {
          id: deliveryItemId,
          plan: {
            organizationId: targetOrganizationId,
          },
        },
        include: {
          Idea: true,
        },
      });

      if (!deliveryItem) {
        return NextResponse.json(
          { error: 'Delivery item not found or does not belong to your organization' },
          { status: 404 }
        );
      }

      // Check if there are available slots
      const assignedCount = deliveryItem.Idea.length;
      if (assignedCount >= deliveryItem.quantity) {
        return NextResponse.json(
          { error: 'This delivery item is already full' },
          { status: 400 }
        );
      }
    }
    
    // Map form values to Prisma enum values
    const mapContentType = (type: string) => {
      switch (type) {
        case 'social-media': return 'SOCIAL_MEDIA_POST';
        case 'blog': return 'BLOG_POST';
        case 'email': return 'NEWSLETTER';
        case 'video': return 'SOCIAL_MEDIA_POST'; // Video content is typically social media
        case 'infographic': return 'SOCIAL_MEDIA_POST'; // Infographics are typically social media
        case 'whitepaper': return 'BLOG_POST'; // Whitepapers are typically blog content
        default: return 'SOCIAL_MEDIA_POST';
      }
    };

    const mapMediaType = (type: string) => {
      switch (type) {
        case 'text': return 'SOCIAL_CARD'; // Text content is typically social cards
        case 'image': return 'PHOTO';
        case 'video': return 'VIDEO';
        case 'audio': return 'SOCIAL_CARD'; // Audio content is typically social cards
        case 'mixed': return 'SOCIAL_CARD'; // Mixed media is typically social cards
        default: return 'SOCIAL_CARD';
      }
    };

    console.log('Mapped values:', {
      contentType: mapContentType(contentType),
      mediaType: mapMediaType(mediaType),
      publishingDateTime: publishingDateTime ? new Date(publishingDateTime) : null,
    });

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
        deliveryItemId: deliveryItemId || null,
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
