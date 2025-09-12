import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('Test API called')
    
    const contentDraft = await prisma.contentDraft.findUnique({
      where: {
        id: 'cmf60t3mc0001wytzsz7bo9er'
      },
      include: {
        Idea: true
      }
    })

    console.log('Test API - Draft found:', !!contentDraft)
    console.log('Test API - Has Idea:', !!contentDraft?.Idea)
    console.log('Test API - Idea title:', contentDraft?.Idea?.title)

    return NextResponse.json({
      success: true,
      draft: contentDraft,
      hasIdea: !!contentDraft?.Idea,
      ideaTitle: contentDraft?.Idea?.title,
      ideaDescription: contentDraft?.Idea?.description
    })
  } catch (error) {
    console.error('Test API Error:', error)
    return NextResponse.json({ error: 'Test API failed' }, { status: 500 })
  }
}
