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
    const linkedInAccount = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: 'linkedin',
      },
    })

    return NextResponse.json({
      isConnected: !!linkedInAccount,
      expiresAt: linkedInAccount?.expires_at,
    })
  } catch (error) {
    console.error('Error checking LinkedIn connection:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 