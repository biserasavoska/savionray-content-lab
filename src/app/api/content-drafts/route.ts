import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CONTENT_TYPE, DRAFT_STATUS } from '@/lib/utils/enum-constants';
import { requireOrganizationContext, createOrgFilter } from '@/lib/utils/organization-context';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get organization context for multi-tenant isolation
    const orgContext = await requireOrganizationContext();

    const body = await request.json();
    console.log('Creating content draft:', body);

    const { ideaId, status, contentType, body: contentBody, metadata } = body;

    if (!ideaId || !status || !contentType || !contentBody) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Validate status is a valid DraftStatus
    if (!Object.values(DRAFT_STATUS).includes(status)) {
      return new NextResponse(`Invalid status. Expected one of: ${Object.values(DRAFT_STATUS).join(', ')}`, { status: 400 });
    }

    // Validate the idea exists and belongs to the user's organization
    const idea = await prisma.idea.findUnique({
      where: { 
        id: ideaId,
        organizationId: orgContext.organizationId // Add organization filter
      },
      select: { id: true, createdById: true }
    });

    if (!idea) {
      return new NextResponse('Idea not found', { status: 404 });
    }

    // Create the content draft
    const contentDraft = await prisma.contentDraft.create({
      data: {
        status: status as any,
        contentType: contentType as any,
        body: contentBody,
        metadata: metadata || {},
        ideaId: ideaId,
        createdById: session.user.id,
        organizationId: orgContext.organizationId // Add organization isolation
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    console.log('Created content draft:', contentDraft);

    return NextResponse.json(contentDraft);
  } catch (error) {
    console.error('Error in content drafts API:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'An error occurred while saving the draft',
      { status: 500 }
    );
  }
} 