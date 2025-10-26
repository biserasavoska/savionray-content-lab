import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all knowledge bases with documents and chunks
    const knowledgeBases = await prisma.knowledgeBase.findMany({
      where: {
        organizationId: {
          in: await prisma.organizationUser.findMany({
            where: { userId: session.user.id, isActive: true },
            select: { organizationId: true }
          }).then(orgs => orgs.map(org => org.organizationId))
        }
      },
      include: {
        documents: {
          include: {
            chunks: true
          }
        }
      }
    })

    return NextResponse.json({ 
      knowledgeBases,
      debug: {
        totalKBs: knowledgeBases.length,
        totalDocuments: knowledgeBases.reduce((sum, kb) => sum + kb.documents.length, 0),
        totalChunks: knowledgeBases.reduce((sum, kb) => 
          sum + kb.documents.reduce((docSum, doc) => docSum + doc.chunks.length, 0), 0
        )
      }
    })
  } catch (error) {
    console.error('Error in KB debug:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
