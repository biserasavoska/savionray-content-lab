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

    const { message, conversationId, model = 'gpt-4o-mini', reasoningEffort, knowledgeBaseId } = await req.json()

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

    // Get knowledge base context if knowledgeBaseId is provided
    let knowledgeContext = ''
    if (knowledgeBaseId) {
      try {
        // Get relevant document chunks from the knowledge base
        const chunks = await prisma.documentChunk.findMany({
          where: {
            document: {
              knowledgeBaseId: knowledgeBaseId,
              status: 'PROCESSED'
            }
          },
          take: 5, // Limit to 5 most relevant chunks
          orderBy: {
            createdAt: 'desc'
          }
        })

        if (chunks.length > 0) {
          knowledgeContext = '\n\n<knowledge_base_context>\n' +
            chunks.map(chunk => `Document: ${chunk.content}`).join('\n\n') +
            '\n</knowledge_base_context>\n'
        }
      } catch (error) {
        console.error('Error fetching knowledge base context:', error)
      }
    }

    // Create a streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Prepare messages for OpenAI with optimized system prompt for GPT-5
          const messages = [
            {
              role: 'system',
              content: `You are Savion Ray AI, a helpful assistant for content creation and marketing.

<core_principles>
- Provide clear, professional, and actionable responses
- Focus on content strategy, creation, and marketing excellence
- Be thorough yet concise - provide complete answers without unnecessary elaboration
- When helping with content, consider audience, tone, and platform best practices
</core_principles>

<persistence>
- Keep going until the user's query is completely resolved
- Don't stop at uncertainty - research or deduce the most reasonable approach
- Only hand back to the user when the task is truly complete
</persistence>

<expertise>
- Content strategy and planning
- Social media marketing
- Brand voice and messaging
- SEO and content optimization
- Multi-platform content adaptation
</expertise>

${knowledgeContext}`
            },
            ...conversationHistory,
            {
              role: 'user',
              content: message
            }
          ]

          // Build OpenAI request configuration
          const requestConfig: any = {
            model: model,
            messages: messages,
            stream: true,
            temperature: 0.7,
            max_tokens: 4000 // Increased for GPT-5's capabilities
          }

          // NOTE: reasoning_effort parameter will be added when officially supported by OpenAI API
          // For now, model selection implicitly controls reasoning depth:
          // - gpt-5-nano: fastest, minimal reasoning
          // - gpt-5-mini: balanced speed and quality
          // - gpt-5: deep reasoning and analysis
          // - gpt-5-pro: maximum reasoning depth
          
          // When reasoning_effort becomes available, uncomment:
          // if (reasoningEffort && ['low', 'medium', 'high'].includes(reasoningEffort)) {
          //   requestConfig.reasoning_effort = reasoningEffort
          // }

          // Create OpenAI streaming request
          const openaiStream = await openai.chat.completions.create(requestConfig)

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
