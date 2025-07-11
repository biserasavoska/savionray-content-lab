import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { UserRole } from '@prisma/client'
import { sendEmailVerification } from '@/lib/email-verification'

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, role } = await req.json()
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'User already exists with this email address' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const userName = name || email.split('@')[0]

    const user = await prisma.user.create({
      data: {
        email,
        name: userName,
        role: (role as UserRole) || 'CREATIVE',
        password: hashedPassword,
        emailVerified: null, // Will be set when email is verified
      },
    })

    // Send email verification
    const emailSent = await sendEmailVerification(user.id, user.email!, userName)

    if (!emailSent) {
      // If email fails, still create the user but warn them
      console.warn('Failed to send verification email for user:', user.id)
    }

    return NextResponse.json({ 
      success: true, 
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name,
        role: user.role 
      },
      message: emailSent 
        ? 'Account created successfully! Please check your email to verify your account.'
        : 'Account created successfully! Please contact support if you don\'t receive a verification email.'
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
} 