import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state') // This is the user ID we passed
  const error = searchParams.get('error')
  const origin = new URL(request.url).origin

  if (error) {
    console.error('LinkedIn OAuth error:', error)
    return NextResponse.redirect(`${origin}/profile?error=linkedin_connection_failed`)
  }

  if (!code || !state) {
    return NextResponse.redirect(`${origin}/profile?error=invalid_callback`)
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${origin}/api/auth/linkedin/callback`,
        client_id: process.env.LINKEDIN_CLIENT_ID!,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
      }).toString(),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('LinkedIn token error:', errorData)
      throw new Error('Failed to get access token')
    }

    const tokenData = await tokenResponse.json()

    // Store the access token in the database
    await prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: 'linkedin',
          providerAccountId: state, // Using state as providerAccountId since it contains user ID
        },
      },
      update: {
        access_token: tokenData.access_token,
        expires_at: Math.floor(Date.now() / 1000 + tokenData.expires_in),
        scope: tokenData.scope,
      },
      create: {
        userId: state,
        type: 'oauth',
        provider: 'linkedin',
        providerAccountId: state,
        access_token: tokenData.access_token,
        expires_at: Math.floor(Date.now() / 1000 + tokenData.expires_in),
        scope: tokenData.scope,
      },
    })

    return NextResponse.redirect(`${origin}/profile?success=linkedin_connected`)
  } catch (error) {
    console.error('Error handling LinkedIn callback:', error)
    return NextResponse.redirect(`${origin}/profile?error=linkedin_connection_failed`)
  }
} 