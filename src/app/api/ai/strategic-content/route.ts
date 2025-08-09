import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateStrategicContent } from '@/lib/openai';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { 
      topic, 
      audience, 
      goals, 
      constraints, 
      model = 'gpt-5-mini',
      includeReasoning = true
    } = body;

    if (!topic || !audience || !goals || !constraints) {
      return NextResponse.json(
        { error: 'Topic, audience, goals, and constraints are required' },
        { status: 400 }
      );
    }

    const result = await generateStrategicContent({
      topic,
      audience,
      goals: Array.isArray(goals) ? goals : [goals],
      constraints: Array.isArray(constraints) ? constraints : [constraints],
      model,
      includeReasoning
    });

    return NextResponse.json({
      success: true,
      strategy: result.strategy,
      content: result.content,
      reasoning: result.reasoning
    });

  } catch (error) {
    console.error('Error in strategic content API:', error);
    return NextResponse.json(
      { error: 'Failed to generate strategic content' },
      { status: 500 }
    );
  }
} 