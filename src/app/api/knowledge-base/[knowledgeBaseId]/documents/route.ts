import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { documentProcessor } from '@/lib/knowledge-base/document-processor'
import { openAIFileService } from '@/lib/openai-file-service'

interface RouteParams {
  params: {
    knowledgeBaseId: string
  }
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const knowledgeBaseId = params.knowledgeBaseId

    // Get documents for the knowledge base
    const documents = await prisma.knowledgeDocument.findMany({
      where: {
        knowledgeBaseId
      },
      include: {
        _count: {
          select: {
            chunks: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ documents })
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const knowledgeBaseId = params.knowledgeBaseId
    const formData = await req.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 })
    }

    // Verify knowledge base access
    const knowledgeBase = await prisma.knowledgeBase.findFirst({
      where: {
        id: knowledgeBaseId,
        organizationId: {
          in: await prisma.organizationUser.findMany({
            where: { userId: session.user.id, isActive: true },
            select: { organizationId: true }
          }).then(orgs => orgs.map(org => org.organizationId))
        }
      }
    })

    if (!knowledgeBase) {
      return NextResponse.json({ error: 'Knowledge base not found' }, { status: 404 })
    }

    // Get file buffer
    const arrayBuffer = await file.arrayBuffer()
    const fileBuffer = Buffer.from(arrayBuffer)

    // Upload to OpenAI Files API
    let openaiFileId: string | null = null
    try {
      console.log('📤 Uploading file to OpenAI...')
      const openaiFile = await openAIFileService.uploadFile(fileBuffer, file.name)
      openaiFileId = openaiFile.id
      console.log('✅ File uploaded to OpenAI:', openaiFileId)
    } catch (error) {
      console.error('❌ Failed to upload to OpenAI:', error)
      // Continue without OpenAI upload for now
    }

    // Create document record
    const document = await prisma.knowledgeDocument.create({
      data: {
        filename: file.name,
        originalName: file.name,
        contentType: file.type,
        size: file.size,
        status: 'UPLOADED',
        openaiFileId,
        knowledgeBaseId
      }
    })

    // Process the document asynchronously
    documentProcessor.processDocument(document.id).catch(error => {
      console.error('Error processing document:', error)
    })

    return NextResponse.json({ document })
  } catch (error) {
    console.error('Error uploading document:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
