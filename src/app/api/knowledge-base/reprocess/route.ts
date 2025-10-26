import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { documentProcessor } from '@/lib/knowledge-base/document-processor'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { documentId } = await req.json()

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 })
    }

    // Verify document access
    const document = await prisma.knowledgeDocument.findFirst({
      where: {
        id: documentId,
        knowledgeBase: {
          organizationId: {
            in: await prisma.organizationUser.findMany({
              where: { userId: session.user.id, isActive: true },
              select: { organizationId: true }
            }).then(orgs => orgs.map(org => org.organizationId))
          }
        }
      }
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Delete existing chunks
    await prisma.documentChunk.deleteMany({
      where: { documentId }
    })

    // Reprocess the document
    await documentProcessor.processDocument(documentId)

    return NextResponse.json({ 
      message: 'Document reprocessed successfully',
      documentId 
    })
  } catch (error) {
    console.error('Error reprocessing document:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
