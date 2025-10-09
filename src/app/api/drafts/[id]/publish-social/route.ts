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

    const publishResults = []

    for (const platform of platforms) {
      try {
        if (platform === 'linkedin') {
          const linkedinResult = await publishToLinkedIn(contentDraft, session.user.id)
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

    // Update the draft status to indicate it's been published and persist links in metadata for now
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

async function publishToLinkedIn(contentDraft: any, userId: string) {
  // 1) Fetch access token from connected LinkedIn account
  const account = await prisma.account.findFirst({
    where: { userId, provider: 'linkedin' }
  })
  if (!account?.access_token) {
    throw new Error('LinkedIn account not connected')
  }

  // Check if token is expired
  if (account.expires_at && account.expires_at < Math.floor(Date.now() / 1000)) {
    throw new Error('LinkedIn access token expired. Please reconnect your LinkedIn account.')
  }

  const accessToken = account.access_token as string
  const linkedinMemberId = account.providerAccountId

  if (!linkedinMemberId) {
    throw new Error('LinkedIn member ID not found. Please reconnect your LinkedIn account.')
  }

  const authorUrn = `urn:li:person:${linkedinMemberId}`

  // 3) Compose simple text post (member UGC)
  const text = (contentDraft.body || contentDraft.Idea?.description || '').toString().slice(0, 2900)
  if (!text) {
    throw new Error('No content to publish')
  }

  const ugcPayload = {
    author: authorUrn,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: { text },
        shareMediaCategory: 'NONE'
      }
    },
    visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'CONNECTIONS' }
  }

  // Retry logic for LinkedIn API calls
  let postRes: Response
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      postRes = await fetch('https://api.linkedin.com/v2/ugcPosts', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        },
        body: JSON.stringify(ugcPayload)
      })

      if (postRes.ok) {
        break // Success, exit retry loop
      }

      // Check if we should retry
      if (postRes.status === 429 || (postRes.status >= 500 && postRes.status < 600)) {
        if (attempt < 3) {
          const delay = Math.pow(2, attempt) * 1000 // Exponential backoff: 2s, 4s
          console.log(`LinkedIn API retry ${attempt}/3 after ${delay}ms for status ${postRes.status}`)
          await new Promise(resolve => setTimeout(resolve, delay))
          continue
        }
      }

      // Don't retry for client errors (4xx except 429)
      const txt = await postRes.text()
      lastError = new Error(`LinkedIn post failed: ${postRes.status} ${txt}`)
      break

    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Network error')
      if (attempt < 3) {
        const delay = Math.pow(2, attempt) * 1000
        console.log(`LinkedIn API retry ${attempt}/3 after ${delay}ms for error:`, lastError.message)
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }
      break
    }
  }

  if (!postRes!.ok) {
    throw lastError || new Error('LinkedIn post failed after retries')
  }

  const postJson = await postRes!.json() as { id: string }
  const postId = postJson.id // e.g. urn:li:ugcPost:XXXXXXXX
  const postUrl = `https://www.linkedin.com/feed/update/${postId}`

  return { postId, url: postUrl }
}
