interface Message {
  id: string
  role: 'USER' | 'ASSISTANT' | 'SYSTEM'
  content: string
  createdAt: string
  isStreaming?: boolean
}

interface Conversation {
  id: string
  title: string | null
  model: string
  settings: any
  isArchived: boolean
  createdAt: string
  updatedAt: string
  messages: Message[]
  _count: {
    messages: number
  }
}

export class ChatService {
  private baseUrl: string

  constructor() {
    this.baseUrl = '/api/chat'
  }

  // Get all conversations
  async getConversations(): Promise<Conversation[]> {
    const response = await fetch(`${this.baseUrl}/conversations`, {
      credentials: 'include'
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch conversations')
    }
    
    const data = await response.json()
    return data.conversations
  }

  // Create a new conversation
  async createConversation(title?: string, model: string = 'gpt-4o-mini'): Promise<Conversation> {
    const response = await fetch(`${this.baseUrl}/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ title, model }),
    })
    
    if (!response.ok) {
      throw new Error('Failed to create conversation')
    }
    
    const data = await response.json()
    return data.conversation
  }

  // Get a specific conversation
  async getConversation(id: string): Promise<Conversation> {
    const response = await fetch(`${this.baseUrl}/conversations/${id}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch conversation')
    }
    
    const data = await response.json()
    return data.conversation
  }

  // Update a conversation
  async updateConversation(id: string, updates: { title?: string; model?: string; settings?: any }): Promise<Conversation> {
    const response = await fetch(`${this.baseUrl}/conversations/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    })
    
    if (!response.ok) {
      throw new Error('Failed to update conversation')
    }
    
    const data = await response.json()
    return data.conversation
  }

  // Delete a conversation
  async deleteConversation(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/conversations/${id}`, {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      throw new Error('Failed to delete conversation')
    }
  }

  // Send a message
  async sendMessage(conversationId: string, content: string, role: 'USER' | 'ASSISTANT' | 'SYSTEM' = 'USER'): Promise<Message> {
    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        conversationId,
        content,
        role,
      }),
    })
    
    if (!response.ok) {
      throw new Error('Failed to send message')
    }
    
    const data = await response.json()
    return data.message
  }

  // Get messages for a conversation
  async getMessages(conversationId: string): Promise<Message[]> {
    const response = await fetch(`${this.baseUrl}/messages?conversationId=${conversationId}`, {
      credentials: 'include'
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch messages')
    }
    
    const data = await response.json()
    return data.messages
  }

  // Stream a response from the AI
  async streamResponse(
    message: string, 
    conversationId?: string, 
    model: string = 'gpt-4o-mini',
    reasoningEffort?: 'low' | 'medium' | 'high'
  ): Promise<ReadableStream<Uint8Array>> {
    const response = await fetch(`${this.baseUrl}/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        message,
        conversationId,
        model,
        reasoningEffort,
      }),
    })
    
    if (!response.ok) {
      throw new Error('Failed to stream response')
    }
    
    return response.body!
  }

  // Parse streaming response
  async parseStreamResponse(stream: ReadableStream<Uint8Array>, onChunk: (chunk: string) => void, onComplete: () => void): Promise<void> {
    const reader = stream.getReader()
    const decoder = new TextDecoder()
    
    try {
      let done = false
      while (!done) {
        const result = await reader.read()
        done = result.done
        
        if (done) break
        
        const chunk = decoder.decode(result.value)
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              
              if (data.content) {
                onChunk(data.content)
              }
              
              if (data.done) {
                onComplete()
                return
              }
              
              if (data.error) {
                throw new Error(data.error)
              }
            } catch (e) {
              console.error('Error parsing stream data:', e)
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }
}

export const chatService = new ChatService()
