import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateChatResponse } from '@/lib/openai'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    const { message, conversation, idea, model } = body

    if (!message || !idea || !model) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    const response = await generateChatResponse({
      message,
      conversation,
      idea,
      model,
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in chat API:', error)
    return new NextResponse(
      error instanceof Error ? error.message : 'An error occurred',
      { status: 500 }
    )
  }
} 