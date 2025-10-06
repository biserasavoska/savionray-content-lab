import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const returnedState = url.searchParams.get('state')
  const origin = `${url.protocol}//${url.host}`

  if (!code || !returnedState) {
    return NextResponse.redirect(`${origin}/profile?error=invalid_callback`)
  }

  // Verify state from cookie
  const cookieStore = cookies()
  const storedState = cookieStore.get('li_oauth_state')?.value
  if (!storedState || storedState !== returnedState) {
    return NextResponse.redirect(`${origin}/profile?error=state_mismatch`)
  }

  const [userId] = returnedState.split(':')

  try {
    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${origin}/api/auth/linkedin/callback`,
        client_id: process.env.LINKEDIN_CLIENT_ID || '',
        client_secret: process.env.LINKEDIN_CLIENT_SECRET || '',
      }).toString(),
    })

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text()
      console.error('LinkedIn token error:', errText)
      return NextResponse.redirect(`${origin}/profile?error=token_exchange_failed`)
    }

    const tokenJson = await tokenResponse.json()
    const accessToken = tokenJson.access_token as string
    const expiresIn = tokenJson.expires_in as number

    // Upsert into NextAuth Account table
    await prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: 'linkedin',
          providerAccountId: userId,
        },
      },
      update: {
        access_token: accessToken,
        expires_at: Math.floor(Date.now() / 1000 + expiresIn),
        token_type: 'Bearer',
        scope: 'profile email',
      },
      create: {
        userId,
        type: 'oauth',
        provider: 'linkedin',
        providerAccountId: userId,
        access_token: accessToken,
        expires_at: Math.floor(Date.now() / 1000 + expiresIn),
        token_type: 'Bearer',
        scope: 'profile email',
      },
    })

    // Clear state cookie
    cookies().set('li_oauth_state', '', { path: '/', maxAge: 0 })

    return NextResponse.redirect(`${origin}/profile?success=linkedin_connected`)
  } catch (err) {
    console.error('LinkedIn callback error:', err)
    return NextResponse.redirect(`${origin}/profile?error=linkedin_connection_failed`)
  }
}


