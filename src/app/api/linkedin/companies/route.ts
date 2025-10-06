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
    // Get user's LinkedIn account
    const linkedInAccount = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: 'linkedin',
      },
    })

    if (!linkedInAccount?.access_token) {
      return NextResponse.json({ 
        error: 'LinkedIn account not connected or token missing' 
      }, { status: 400 })
    }

    // Fetch user's company pages from LinkedIn API
    const response = await fetch('https://api.linkedin.com/rest/organizationalEntityAcls?q=roleAssignee&role=ADMINISTRATOR&state=APPROVED', {
      headers: {
        'Authorization': `Bearer ${linkedInAccount.access_token}`,
        'LinkedIn-Version': '202501',
        'X-Restli-Protocol-Version': '2.0.0'
      }
    })

    if (!response.ok) {
      throw new Error(`LinkedIn API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Extract company information
    const companies = data.elements?.map((element: any) => ({
      id: element.organizationalTarget,
      name: element.organizationalTarget, // We'll need to fetch names separately
      role: element.role
    })) || []

    return NextResponse.json({ companies })
  } catch (error) {
    console.error('Error fetching LinkedIn company pages:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
