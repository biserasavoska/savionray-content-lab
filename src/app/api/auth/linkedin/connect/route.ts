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
  const redirectUri = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/linkedin/callback`
  const scope = 'profile email'

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


