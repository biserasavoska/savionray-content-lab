import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ContentType, DraftStatus } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    console.log('Creating content draft:', body);

    const { ideaId, status, contentType, body: contentBody, metadata } = body;

    if (!ideaId || !status || !contentType || !contentBody) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Validate status is a valid DraftStatus
    if (!Object.values(DraftStatus).includes(status)) {
      return new NextResponse(`Invalid status. Expected one of: ${Object.values(DraftStatus).join(', ')}`, { status: 400 });
    }

    // Validate the idea exists and belongs to the user
    const idea = await prisma.idea.findUnique({
      where: { id: ideaId },
      select: { id: true, createdById: true }
    });

    if (!idea) {
      return new NextResponse('Idea not found', { status: 404 });
    }

    // Create the content draft
    const contentDraft = await prisma.contentDraft.create({
      data: {
        status: status as DraftStatus,
        contentType: contentType as ContentType,
        body: contentBody,
        metadata: metadata || {},
        idea: { connect: { id: ideaId } },
        createdBy: { connect: { id: session.user.id } }
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