import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateSocialContent, getOptimalGPT5Model } from '@/lib/openai';
import { AVAILABLE_MODELS } from '@/lib/models';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { 
      testType = 'basic',
      model = 'gpt-5-mini'
    } = body;

    // Test different GPT-5 features
    if (testType === 'optimal-routing') {
      const optimal = getOptimalGPT5Model('medium', 'standard', 'balanced');
      return NextResponse.json({
        success: true,
        message: 'Optimal routing test',
        result: optimal
      });
    }

    if (testType === 'model-availability') {
      const gpt5Models = AVAILABLE_MODELS.filter(m => m.supportsGPT5Features);
      return NextResponse.json({
        success: true,
        message: 'GPT-5 models available',
        models: gpt5Models.map(m => ({
          id: m.id,
          name: m.name,
          description: m.description,
          features: m.gpt5Features,
          cost: {
            input: m.costPerToken,
            output: m.outputCostPerToken
          }
        }))
      });
    }

    // Basic content generation test
    if (testType === 'content-generation') {
      const content = await generateSocialContent({
        title: 'GPT-5 Integration Test',
        description: 'Testing the new GPT-5 integration with enhanced parameters',
        format: 'linkedin',
        model: model,
        gpt5Options: {
          verbosity: 'medium',
          reasoningEffort: 'medium',
          maxOutputTokens: 1000
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Content generation test',
        content: content,
        modelUsed: model
      });
    }

    return NextResponse.json({
      success: true,
      message: 'GPT-5 integration is working',
      availableTests: ['basic', 'optimal-routing', 'model-availability', 'content-generation'],
      gpt5ModelsCount: AVAILABLE_MODELS.filter(m => m.supportsGPT5Features).length
    });

  } catch (error) {
    console.error('Error in GPT-5 test API:', error);
    return NextResponse.json(
      { 
        error: 'Test failed', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
