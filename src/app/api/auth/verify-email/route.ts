import { NextRequest, NextResponse } from 'next/server'

import { verifyEmailToken, sendWelcomeEmail } from '@/lib/email-verification'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      )
    }

    const result = await verifyEmailToken(token)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Verification failed' },
        { status: 400 }
      )
    }

    // Get user details for welcome email
    const user = await prisma.user.findUnique({
      where: { id: result.userId },
      select: { email: true, name: true }
    })

    if (user?.email && user?.name) {
      // Send welcome email
      await sendWelcomeEmail(user.email, user.name)
    }

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully! Welcome to SavionRay Content Lab.'
    })
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      )
    }

    const result = await verifyEmailToken(token)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Verification failed' },
        { status: 400 }
      )
    }

    // Get user details for welcome email
    const user = await prisma.user.findUnique({
      where: { id: result.userId },
      select: { email: true, name: true }
    })

    if (user?.email && user?.name) {
      // Send welcome email
      await sendWelcomeEmail(user.email, user.name)
    }

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully! Welcome to SavionRay Content Lab.'
    })
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 