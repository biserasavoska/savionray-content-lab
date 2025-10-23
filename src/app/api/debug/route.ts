import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 DEBUG: Debug endpoint called')
    
    // Test 1: Basic response
    const basicTest = { status: 'ok', timestamp: new Date().toISOString() }
    console.log('✅ Basic test passed:', basicTest)
    
    // Test 2: Session check
    const session = await getServerSession(authOptions)
    console.log('🔍 Session check:', session?.user ? 'authenticated' : 'not authenticated')
    console.log('🔍 Session user:', session?.user?.email || 'no user')
    
    // Test 3: Database connection
    let dbTest: { status: string; error?: string } = { status: 'unknown' }
    try {
      await prisma.$queryRaw`SELECT 1`
      dbTest = { status: 'connected' }
      console.log('✅ Database connection test passed')
    } catch (dbError) {
      dbTest = { status: 'failed', error: dbError instanceof Error ? dbError.message : 'unknown' }
      console.error('❌ Database connection test failed:', dbError)
    }
    
    // Test 4: ChatConversation table
    let tableTest: { status: string; count?: number; error?: string } = { status: 'unknown' }
    try {
      const count = await prisma.chatConversation.count()
      tableTest = { status: 'exists', count }
      console.log('✅ ChatConversation table test passed, count:', count)
    } catch (tableError) {
      tableTest = { status: 'failed', error: tableError instanceof Error ? tableError.message : 'unknown' }
      console.error('❌ ChatConversation table test failed:', tableError)
    }
    
    return NextResponse.json({
      basicTest,
      sessionTest: {
        authenticated: !!session?.user,
        userEmail: session?.user?.email || null,
        userId: session?.user?.id || null
      },
      dbTest,
      tableTest,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL
      }
    })
  } catch (error) {
    console.error('❌ Debug endpoint error:', error)
    return NextResponse.json({ 
      error: 'Debug endpoint failed',
      details: error instanceof Error ? error.message : 'unknown',
      stack: error instanceof Error ? error.stack : 'no stack'
    }, { status: 500 })
  }
}
