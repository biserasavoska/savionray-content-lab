import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateChatResponse } from '@/lib/openai'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { message, conversation, idea, model } = body

    if (!message || !conversation || !idea || !model) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate chat response
    const response = await generateChatResponse({
      message,
      conversation,
      idea,
      model,
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in chat API:', error)
    return NextResponse.json(
      error instanceof Error ? error.message : 'An error occurred while generating chat response',
      { status: 500 }
    )
  }
} 