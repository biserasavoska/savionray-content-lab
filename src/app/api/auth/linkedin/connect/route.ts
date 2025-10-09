import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { randomBytes } from 'crypto'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL('/auth/signin?error=Unauthorized', req.url))
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID
  // Prefer explicit NEXTAUTH_URL, otherwise derive from the incoming request
  const baseUrl = process.env.NEXTAUTH_URL || new URL(req.url).origin
  const redirectUri = `${baseUrl}/api/auth/linkedin/callback`
  
  // Debug logging for Railway
  console.log('🔍 LinkedIn Connect Debug:', {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    reqUrl: req.url,
    baseUrl,
    redirectUri,
    clientId: clientId ? `${clientId.substring(0, 8)}...` : 'NOT_SET'
  })
  
  // Request both authentication and posting permissions in one step
  const scope = 'openid profile email w_member_social'

  if (!clientId) {
    return new NextResponse('LinkedIn Client ID not configured', { status: 500 })
  }

  // CSRF protection: generate and store state in httpOnly cookie
  const state = `${session.user.id}:${randomBytes(16).toString('hex')}`
  const cookieStore = cookies()
  cookieStore.set('li_oauth_state', state, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 10 * 60, // 10 minutes
  })

  const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization')
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('client_id', clientId)
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('state', state)
  authUrl.searchParams.set('scope', scope)

  return NextResponse.redirect(authUrl.toString())
}


