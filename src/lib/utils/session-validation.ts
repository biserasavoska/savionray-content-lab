import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

/**
 * 🚨 CRITICAL: Session User Validation Utility
 * 
 * This utility function validates that a session user exists in the database
 * and returns the REAL user ID from the database, not the session ID.
 * 
 * This prevents foreign key constraint violations that occur when:
 * - Session contains user ID: 'cmeluak7w0002qr6hsoy3zsza'
 * - Database contains user ID: 'cmel76whl0002o96h1wlxj4j0'
 * 
 * @returns Promise<{ success: boolean, realUserId?: string, error?: string, status?: number }>
 */
export async function validateSessionUser() {
  try {
    // Get the session
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return {
        success: false,
        error: 'Authentication required',
        status: 401
      }
    }

    // CRITICAL: Verify session user exists in database and get the REAL user ID
    const sessionUserInDb = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        id: true, 
        email: true, 
        role: true
      }
    })
    
    if (!sessionUserInDb) {
      return {
        success: false,
        error: 'Session user not found in database',
        status: 401
      }
    }

    // Return the REAL user ID from database, not the session ID
    return {
      success: true,
      realUserId: sessionUserInDb.id,
      userEmail: sessionUserInDb.email,
      userRole: sessionUserInDb.role,
      sessionUserId: session.user.id // For debugging purposes
    }
    
  } catch (error) {
    console.error('Session validation error:', error)
    return {
      success: false,
      error: 'Session validation failed',
      status: 500
    }
  }
}

/**
 * 🚨 CRITICAL: Session User Validation with Response Helper
 * 
 * This function validates the session user and returns a proper NextResponse
 * if validation fails, or the validated user data if successful.
 * 
 * @returns Promise<{ success: boolean, data?: any, response?: NextResponse }>
 */
export async function validateSessionUserWithResponse() {
  const validation = await validateSessionUser()
  
  if (!validation.success) {
    return {
      success: false,
      response: NextResponse.json(
        { error: validation.error },
        { status: validation.status || 401 }
      )
    }
  }

  return {
    success: true,
    data: {
      realUserId: validation.realUserId,
      userEmail: validation.userEmail,
      userRole: validation.userRole,
      sessionUserId: validation.sessionUserId
    }
  }
}

/**
 * 🚨 CRITICAL: Quick Session User ID Getter
 * 
 * For simple cases where you just need the real user ID.
 * Throws an error if validation fails.
 * 
 * @returns Promise<string> - The real user ID from database
 * @throws Error if session validation fails
 */
export async function getRealUserId(): Promise<string> {
  const validation = await validateSessionUser()
  
  if (!validation.success) {
    throw new Error(`Session validation failed: ${validation.error}`)
  }
  
  return validation.realUserId!
}

/**
 * 🚨 CRITICAL: Session User Validation for Admin Routes
 * 
 * Validates session user and ensures they have admin privileges.
 * 
 * @returns Promise<{ success: boolean, realUserId?: string, error?: string, status?: number }>
 */
export async function validateAdminSessionUser() {
  const validation = await validateSessionUser()
  
  if (!validation.success) {
    return validation
  }

  // Check if user has admin role
  if (validation.userRole !== 'ADMIN') {
    return {
      success: false,
      error: 'Admin access required',
      status: 403
    }
  }

  return validation
}
