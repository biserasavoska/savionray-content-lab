import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions , isCreative, isAdmin } from '@/lib/auth';
import { generateSocialContent } from '@/lib/openai';
import { AVAILABLE_MODELS } from '@/lib/models';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    console.log('Content generation request:', body);

    const { 
      title, 
      description, 
      format, 
      model, 
      additionalContext,
      includeReasoning = false,
      reasoningSummary = false,
      encryptedReasoning = false
    } = body;

    if (!title || !description || !format || !model) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate model if provided
    const selectedModel = AVAILABLE_MODELS.find(m => m.id === model);
    if (!selectedModel) {
      return NextResponse.json(
        { error: 'Invalid model selected' },
        { status: 400 }
      );
    }

    // Validate reasoning options
    if (includeReasoning && !selectedModel.supportsReasoning) {
      return NextResponse.json(
        { error: 'Selected model does not support reasoning features' },
        { status: 400 }
      );
    }

    if (reasoningSummary && !selectedModel.reasoningFeatures?.summaries) {
      return NextResponse.json(
        { error: 'Selected model does not support reasoning summaries' },
        { status: 400 }
      );
    }

    if (encryptedReasoning && !selectedModel.reasoningFeatures?.encryptedContent) {
      return NextResponse.json(
        { error: 'Selected model does not support encrypted reasoning' },
        { status: 400 }
      );
    }

    // Generate social media content with reasoning support
    const content = await generateSocialContent({
      title,
      description: `${description}\n\nAdditional Context: ${additionalContext || 'None'}`,
      format,
      model,
      includeReasoning,
      reasoningSummary,
      encryptedReasoning,
    });

    console.log('Generated content response:', content);

    if (!content || (!content.postText && !content.hashtags && !content.callToAction)) {
      return NextResponse.json(
        { error: 'Failed to generate content' },
        { status: 500 }
      );
    }

    return NextResponse.json(content);
  } catch (error) {
    console.error('Error in content generation API:', error);
    return NextResponse.json(
      error instanceof Error ? error.message : 'An error occurred while generating content',
      { status: 500 }
    );
  }
} 