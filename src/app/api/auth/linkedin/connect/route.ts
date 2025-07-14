import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const { clientId, redirectUri, scope } = await request.json()

    // Construct LinkedIn OAuth URL
    const linkedInAuthUrl = new URL('https://www.linkedin.com/oauth/v2/authorization')
    linkedInAuthUrl.searchParams.append('response_type', 'code')
    linkedInAuthUrl.searchParams.append('client_id', clientId)
    linkedInAuthUrl.searchParams.append('redirect_uri', redirectUri)
    linkedInAuthUrl.searchParams.append('state', session.user.id) // Use user ID as state
    linkedInAuthUrl.searchParams.append('scope', scope)

    return NextResponse.json({ authUrl: linkedInAuthUrl.toString() })
  } catch (error) {
    console.error('Error initiating LinkedIn connection:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 