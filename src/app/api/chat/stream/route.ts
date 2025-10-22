import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.');
  }
  
  const { OpenAI } = require('openai');
  return new OpenAI({
    apiKey: apiKey,
  });
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { message, conversationId, model = 'gpt-4o-mini' } = await req.json()

    if (!message) {
      return new Response('Message is required', { status: 400 })
    }

    // Validate message length
    if (message.length > 4000) {
      return new Response('Message too long (max 4000 characters)', { status: 400 })
    }

    // Get OpenAI client
    const openai = getOpenAIClient()

    // Get conversation history if conversationId is provided
    let conversationHistory: any[] = []
    if (conversationId) {
      const conversation = await prisma.chatConversation.findFirst({
        where: {
          id: conversationId,
          createdById: session.user.id
        },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            take: 10 // Last 10 messages for context
          }
        }
      })

      if (conversation) {
        conversationHistory = conversation.messages.map(msg => ({
          role: msg.role.toLowerCase(),
          content: msg.content
        }))
      }
    }

    // Create a streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Prepare messages for OpenAI
          const messages = [
            {
              role: 'system',
              content: 'You are Savion Ray AI, a helpful assistant for content creation and marketing. Provide clear, professional, and actionable responses.'
            },
            ...conversationHistory,
            {
              role: 'user',
              content: message
            }
          ]

          // Create OpenAI streaming request
          const openaiStream = await openai.chat.completions.create({
            model: model,
            messages: messages,
            stream: true,
            temperature: 0.7,
            max_tokens: 2000
          })

          let fullResponse = ''

          // Stream the response from OpenAI
          for await (const chunk of openaiStream) {
            const content = chunk.choices[0]?.delta?.content
            
            if (content) {
              fullResponse += content
              controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ content })}\n\n`))
            }
          }

          // Save the AI response to database if conversationId is provided
          if (conversationId && fullResponse) {
            try {
              await prisma.chatMessage.create({
                data: {
                  conversationId,
                  role: 'ASSISTANT',
                  content: fullResponse
                }
              })

              // Update conversation timestamp
              await prisma.chatConversation.update({
                where: { id: conversationId },
                data: { updatedAt: new Date() }
              })
            } catch (dbError) {
              console.error('Error saving AI response to database:', dbError)
              // Don't fail the request if database save fails
            }
          }

          // Send completion signal
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ done: true })}\n\n`))
          controller.close()
        } catch (error) {
          console.error('Streaming error:', error)
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ error: 'Failed to generate response' })}\n\n`))
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Error in streaming API:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
