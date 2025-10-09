import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    console.log('Checking LinkedIn connection for user:', session.user.id)
    
    const linkedInAccount = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: 'linkedin',
      },
    })

    console.log('LinkedIn account found:', !!linkedInAccount)
    if (linkedInAccount) {
      console.log('LinkedIn account details:', {
        id: linkedInAccount.id,
        provider: linkedInAccount.provider,
        hasAccessToken: !!linkedInAccount.access_token,
        expiresAt: linkedInAccount.expires_at,
        providerAccountId: linkedInAccount.providerAccountId
      })
    }

    if (!linkedInAccount?.access_token) {
      return NextResponse.json({
        isConnected: false,
        needsReconnect: true,
        reason: 'No LinkedIn account found'
      })
    }

    // Check if token is expired
    const isExpired = linkedInAccount.expires_at && linkedInAccount.expires_at < Math.floor(Date.now() / 1000)
    
    if (isExpired) {
      return NextResponse.json({
        isConnected: false,
        needsReconnect: true,
        reason: 'LinkedIn access token expired',
        expiresAt: linkedInAccount.expires_at
      })
    }

    // Validate token by calling LinkedIn API
    try {
      const userinfoRes = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: { Authorization: `Bearer ${linkedInAccount.access_token}` }
      })
      
      if (!userinfoRes.ok) {
        return NextResponse.json({
          isConnected: false,
          needsReconnect: true,
          reason: 'LinkedIn token validation failed',
          status: userinfoRes.status
        })
      }

      const userinfo = await userinfoRes.json()
      
      return NextResponse.json({
        isConnected: true,
        needsReconnect: false,
        expiresAt: linkedInAccount.expires_at,
        memberId: linkedInAccount.providerAccountId,
        scope: linkedInAccount.scope,
        canPost: linkedInAccount.scope?.includes('w_member_social') || false,
        userinfo: {
          sub: userinfo.sub,
          name: userinfo.name,
          email: userinfo.email
        }
      })
    } catch (apiError) {
      console.error('LinkedIn API validation error:', apiError)
      return NextResponse.json({
        isConnected: false,
        needsReconnect: true,
        reason: 'LinkedIn API validation failed',
        error: apiError instanceof Error ? apiError.message : 'Unknown error'
      })
    }

  } catch (error) {
    console.error('Error checking LinkedIn connection:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 