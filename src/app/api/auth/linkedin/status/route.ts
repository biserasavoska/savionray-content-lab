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
        expiresAt: linkedInAccount.expires_at
      })
    }

    return NextResponse.json({
      isConnected: !!linkedInAccount,
      expiresAt: linkedInAccount?.expires_at,
    })
  } catch (error) {
    console.error('Error checking LinkedIn connection:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 