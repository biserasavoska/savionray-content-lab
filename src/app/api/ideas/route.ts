import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireOrganizationContext } from '@/lib/utils/organization-context';

export async function GET(request: NextRequest) {
  try {
    const context = await requireOrganizationContext(undefined, request);
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    
    const skip = (page - 1) * limit;
    
    const where: any = {
      organizationId: context.organizationId,
    };
    
    if (status) {
      where.status = status;
    }
    
    const [ideas, total] = await Promise.all([
      prisma.idea.findMany({
        where,
        orderBy: { createdAt: 'desc' },
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
    const context = await requireOrganizationContext(undefined, request);
    const body = await request.json();
    
    const { title, description, contentType, mediaType, publishingDateTime } = body;
    
    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
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
        createdById: context.userId,
        organizationId: context.organizationId,
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
