import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateAdminSessionUser } from '@/lib/utils/session-validation'
import { logger } from '@/lib/utils/logger'

export async function GET(request: NextRequest) {
  try {
    const validation = await validateAdminSessionUser()

    if (!validation.success) {
      logger.warn('Unauthorized attempt to fetch users', {
        error: validation.error,
        status: validation.status
      })
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status || 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search')
    const role = searchParams.get('role')

    const skip = (page - 1) * limit

    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (role) {
      where.role = role
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          emailVerified: true,
          isSuperAdmin: true
        },
        orderBy: { id: 'desc' },
        skip,
        take: limit
      }),
      prisma.user.count({ where })
    ])

    const totalPages = Math.ceil(total / limit)

    logger.info('Users fetched by admin', {
      adminId: validation.realUserId,
      adminEmail: validation.userEmail,
      userCount: users.length,
      totalUsers: total,
      page,
      search,
      role
    })

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    })

  } catch (error) {
    logger.error('Error fetching users', error instanceof Error ? error : new Error(String(error)), {
      timestamp: new Date().toISOString()
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
