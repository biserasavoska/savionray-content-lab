import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { getOrganizationContext } from '@/lib/utils/organization-context'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgContext = await getOrganizationContext(undefined, req)
    if (!orgContext?.organizationId) {
      return NextResponse.json({ error: 'Organization context required' }, { status: 400 })
    }

    // Find the content draft
    const contentDraft = await prisma.contentDraft.findUnique({
      where: { 
        id: params.id,
        organizationId: orgContext.organizationId
      },
      include: {
        Idea: true,
        User: true
      }
    })

    if (!contentDraft) {
      return NextResponse.json({ error: 'Content draft not found' }, { status: 404 })
    }

    // Check if draft is approved
    if (contentDraft.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Only approved drafts can be published' }, { status: 400 })
    }

    // Get the request body to determine which platforms to publish to
    const body = await req.json()
    const { platforms = ['linkedin'] } = body

    // For now, we'll simulate publishing to LinkedIn
    // In a real implementation, you'd integrate with LinkedIn's API
    const publishResults = []

    for (const platform of platforms) {
      try {
        if (platform === 'linkedin') {
          // Simulate LinkedIn publishing
          const linkedinResult = await publishToLinkedIn(contentDraft)
          publishResults.push({
            platform: 'linkedin',
            success: true,
            postId: linkedinResult.postId,
            url: linkedinResult.url
          })
        }
        // Add other platforms here (Twitter, Facebook, etc.)
      } catch (error) {
        publishResults.push({
          platform,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Update the draft status to indicate it's been published
    await prisma.contentDraft.update({
      where: { id: params.id },
      data: {
        status: 'PUBLISHED',
        metadata: {
          ...(contentDraft.metadata as Record<string, any> || {}),
          publishedTo: publishResults,
          publishedAt: new Date().toISOString()
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Content published successfully',
      results: publishResults
    })

  } catch (error) {
    console.error('Failed to publish content to social media:', error)
    return NextResponse.json(
      { error: 'Failed to publish content to social media' },
      { status: 500 }
    )
  }
}

// Simulate LinkedIn publishing - replace with actual LinkedIn API integration
async function publishToLinkedIn(contentDraft: any) {
  // This is a simulation - in reality you'd:
  // 1. Get LinkedIn access token from user's connected account
  // 2. Format content according to LinkedIn's requirements
  // 3. Call LinkedIn's API to create a post
  // 4. Return the actual post ID and URL
  
  const content = contentDraft.body || contentDraft.Idea?.description || 'No content available'
  const title = contentDraft.Idea?.title || 'Untitled Content'
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Simulate successful publishing
  return {
    postId: `li_${Date.now()}`,
    url: `https://www.linkedin.com/posts/activity-${Date.now()}`,
    content: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
    title
  }
}
