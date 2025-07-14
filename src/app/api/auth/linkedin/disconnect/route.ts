import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    // Delete the LinkedIn account connection
    await prisma.account.deleteMany({
      where: {
        userId: session.user.id,
        provider: 'linkedin',
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error disconnecting LinkedIn:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 