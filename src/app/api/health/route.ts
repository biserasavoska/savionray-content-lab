import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'

export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      database: 'unknown',
      auth: 'unknown',
      environment: 'unknown'
    }
  }

  try {
    // Check database connection
    try {
      await prisma.$queryRaw`SELECT 1`
      health.checks.database = 'healthy'
    } catch (error) {
      health.checks.database = 'unhealthy'
      health.status = 'unhealthy'
      logger.error('Database health check failed', error instanceof Error ? error : new Error(String(error)))
    }

    // Check environment variables
    const requiredEnvVars = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL'
    ]
    
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar])
    if (missingEnvVars.length > 0) {
      health.checks.environment = 'unhealthy'
      health.status = 'unhealthy'
      logger.error('Missing required environment variables', new Error(`Missing: ${missingEnvVars.join(', ')}`), { missing: missingEnvVars })
    } else {
      health.checks.environment = 'healthy'
    }

    // Check auth configuration
    if (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_URL) {
      health.checks.auth = 'healthy'
    } else {
      health.checks.auth = 'unhealthy'
      health.status = 'unhealthy'
    }

    const statusCode = health.status === 'healthy' ? 200 : 503
    
    return NextResponse.json(health, { status: statusCode })
  } catch (error) {
    logger.error('Health check failed', error instanceof Error ? error : new Error(String(error)))
    return NextResponse.json(
      { 
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed'
      },
      { status: 503 }
    )
  }
} 