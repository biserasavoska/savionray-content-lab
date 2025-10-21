import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateSocialContent } from '@/lib/openai'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { message, conversationId, model = 'gpt-5-mini' } = await req.json()

    if (!message) {
      return new Response('Message is required', { status: 400 })
    }

    // Create a streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Generate content using existing OpenAI integration
          const content = await generateSocialContent({
            title: 'Chat Response',
            description: message,
            format: 'chat-response',
            model
          })

          // Stream the response
          const responseText = content.postText || 'I apologize, but I could not generate a response at this time.'
          
          // Send response in chunks to simulate streaming
          const words = responseText.split(' ')
          for (let i = 0; i < words.length; i++) {
            const chunk = words[i] + (i < words.length - 1 ? ' ' : '')
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ content: chunk })}\n\n`))
            
            // Add a small delay to simulate streaming
            await new Promise(resolve => setTimeout(resolve, 50))
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
