interface KnowledgeBase {
  id: string
  name: string
  description: string | null
  isPublic: boolean
  createdAt: string
  updatedAt: string
  documents: KnowledgeDocument[]
  _count: {
    documents: number
  }
}

interface KnowledgeDocument {
  id: string
  filename: string
  originalName: string
  contentType: string
  size: number
  status: 'UPLOADED' | 'PROCESSING' | 'PROCESSED' | 'FAILED'
  createdAt: string
  _count: {
    chunks: number
  }
}

interface DocumentChunk {
  id: string
  content: string
  metadata: any
  chunkIndex: number
  documentId: string
}

export class KnowledgeBaseService {
  private baseUrl: string

  constructor() {
    this.baseUrl = '/api/knowledge-base'
  }

  // Get all knowledge bases
  async getKnowledgeBases(): Promise<KnowledgeBase[]> {
    const response = await fetch(`${this.baseUrl}`, {
      credentials: 'include'
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch knowledge bases')
    }
    
    const data = await response.json()
    return data.knowledgeBases
  }

  // Create a new knowledge base
  async createKnowledgeBase(name: string, description?: string, isPublic: boolean = false): Promise<KnowledgeBase> {
    const response = await fetch(`${this.baseUrl}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ name, description, isPublic }),
    })
    
    if (!response.ok) {
      throw new Error('Failed to create knowledge base')
    }
    
    const data = await response.json()
    return data.knowledgeBase
  }

  // Get a specific knowledge base
  async getKnowledgeBase(id: string): Promise<KnowledgeBase> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      credentials: 'include'
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch knowledge base')
    }
    
    const data = await response.json()
    return data.knowledgeBase
  }

  // Update a knowledge base
  async updateKnowledgeBase(id: string, updates: { name?: string; description?: string; isPublic?: boolean }): Promise<KnowledgeBase> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(updates),
    })
    
    if (!response.ok) {
      throw new Error('Failed to update knowledge base')
    }
    
    const data = await response.json()
    return data.knowledgeBase
  }

  // Delete a knowledge base
  async deleteKnowledgeBase(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    })
    
    if (!response.ok) {
      throw new Error('Failed to delete knowledge base')
    }
  }

  // Get documents for a knowledge base
  async getDocuments(knowledgeBaseId: string): Promise<KnowledgeDocument[]> {
    const response = await fetch(`${this.baseUrl}/${knowledgeBaseId}/documents`, {
      credentials: 'include'
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch documents')
    }
    
    const data = await response.json()
    return data.documents
  }

  // Upload a document to a knowledge base
  async uploadDocument(knowledgeBaseId: string, file: File, title?: string): Promise<KnowledgeDocument> {
    const formData = new FormData()
    formData.append('file', file)
    if (title) {
      formData.append('title', title)
    }

    const response = await fetch(`${this.baseUrl}/${knowledgeBaseId}/documents`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    })
    
    if (!response.ok) {
      throw new Error('Failed to upload document')
    }
    
    const data = await response.json()
    return data.document
  }

  // Search documents in a knowledge base
  async searchDocuments(knowledgeBaseId: string, query: string, limit: number = 10): Promise<DocumentChunk[]> {
    const response = await fetch(`${this.baseUrl}/${knowledgeBaseId}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ query, limit }),
    })
    
    if (!response.ok) {
      throw new Error('Failed to search documents')
    }
    
    const data = await response.json()
    return data.chunks
  }
}

export const knowledgeBaseService = new KnowledgeBaseService()
