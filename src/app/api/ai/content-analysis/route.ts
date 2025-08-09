import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { analyzeContentWithReasoning } from '@/lib/openai';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { 
      content, 
      contentType, 
      targetAudience, 
      brandVoice, 
      model = 'gpt-5-mini',
      includeStepByStep = true,
      includeConfidence = true
    } = body;

    if (!content || !contentType) {
      return NextResponse.json(
        { error: 'Content and content type are required' },
        { status: 400 }
      );
    }

    const analysis = await analyzeContentWithReasoning({
      content,
      contentType,
      targetAudience: targetAudience || 'professionals',
      brandVoice: brandVoice || 'professional',
      model,
      includeStepByStep,
      includeConfidence
    });

    return NextResponse.json({
      success: true,
      analysis: analysis.analysis,
      reasoning: analysis.reasoning
    });

  } catch (error) {
    console.error('Error in content analysis API:', error);
    return NextResponse.json(
      { error: 'Failed to analyze content' },
      { status: 500 }
    );
  }
} 