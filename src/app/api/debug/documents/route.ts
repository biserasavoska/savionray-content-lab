import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    // Check all documents and their chunks
    const documents = await prisma.knowledgeDocument.findMany({
      include: {
        chunks: true,
        knowledgeBase: {
          select: {
            name: true
          }
        }
      }
    })

    // Check all chunks
    const chunks = await prisma.documentChunk.findMany({
      include: {
        document: {
          select: {
            originalName: true,
            status: true
          }
        }
      }
    })

    return NextResponse.json({
      documents: documents.map(doc => ({
        id: doc.id,
        filename: doc.originalName,
        status: doc.status,
        knowledgeBase: doc.knowledgeBase.name,
        chunkCount: doc.chunks.length,
        chunks: doc.chunks.map(chunk => ({
          id: chunk.id,
          content: chunk.content.substring(0, 100) + '...', // First 100 chars
          chunkIndex: chunk.chunkIndex
        }))
      })),
      totalDocuments: documents.length,
      totalChunks: chunks.length,
      chunks: chunks.map(chunk => ({
        id: chunk.id,
        documentName: chunk.document.originalName,
        content: chunk.content.substring(0, 200) + '...', // First 200 chars
        chunkIndex: chunk.chunkIndex
      }))
    })
  } catch (error) {
    console.error('Error checking documents:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
