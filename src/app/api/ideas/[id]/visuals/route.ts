import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateImage } from '@/lib/openai';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: ideaId } = params;
  const { prompt } = await req.json();

  if (!prompt) {
    return NextResponse.json({ error: 'A prompt is required.' }, { status: 400 });
  }

  try {
    // 1. Generate the image using OpenAI
    const imageUrl = await generateImage(prompt);

    if (!imageUrl) {
      return NextResponse.json({ error: 'Failed to generate image.' }, { status: 500 });
    }

    // 2. Create the VisualDraft record in the database
    const visualDraft = await prisma.visualDraft.create({
      data: {
        imageUrl: imageUrl,
        status: 'PENDING_REVIEW',
        metadata: {
          prompt: prompt,
        },
        idea: {
          connect: { id: ideaId },
        },
        createdBy: {
          connect: { id: session.user.id },
        },
      },
    });

    return NextResponse.json(visualDraft, { status: 201 });
  } catch (error) {
    console.error('Failed to create visual draft:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ error: 'Failed to create visual draft.', details: errorMessage }, { status: 500 });
  }
} 