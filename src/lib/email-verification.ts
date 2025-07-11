import { randomBytes, createHash } from 'crypto'
import { prisma } from './prisma'
import { sendEmail } from './actions/email'

export interface EmailVerificationToken {
  id: string
  userId: string
  token: string
  expiresAt: Date
  used: boolean
}

/**
 * Generate a secure verification token
 */
export function generateVerificationToken(): string {
  return randomBytes(32).toString('hex')
}

/**
 * Create an email verification token for a user
 */
export async function createEmailVerificationToken(userId: string): Promise<string> {
  const token = generateVerificationToken()
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  await prisma.emailVerificationToken.create({
    data: {
      userId,
      token,
      expiresAt,
      used: false
    }
  })

  return token
}

/**
 * Verify an email verification token
 */
export async function verifyEmailToken(token: string): Promise<{ success: boolean; userId?: string; error?: string }> {
  try {
    const verificationToken = await prisma.emailVerificationToken.findFirst({
      where: {
        token,
        used: false,
        expiresAt: {
          gt: new Date()
        }
      }
    })

    if (!verificationToken) {
      return { success: false, error: 'Invalid or expired token' }
    }

    // Mark token as used
    await prisma.emailVerificationToken.update({
      where: { id: verificationToken.id },
      data: { used: true }
    })

    // Update user email verification status
    await prisma.user.update({
      where: { id: verificationToken.userId },
      data: { emailVerified: new Date() }
    })

    return { success: true, userId: verificationToken.userId }
  } catch (error) {
    console.error('Error verifying email token:', error)
    return { success: false, error: 'Verification failed' }
  }
}

/**
 * Send email verification email
 */
export async function sendEmailVerification(userId: string, email: string, name: string): Promise<boolean> {
  try {
    const token = await createEmailVerificationToken(userId)
    const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`

    const emailContent = {
      to: email,
      subject: 'Verify your email address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to SavionRay Content Lab!</h2>
          <p>Hi ${name},</p>
          <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create an account, you can safely ignore this email.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            This email was sent from SavionRay Content Lab. Please do not reply to this email.
          </p>
        </div>
      `
    }

    await sendEmail(emailContent)
    return true
  } catch (error) {
    console.error('Error sending email verification:', error)
    return false
  }
}

/**
 * Send welcome email after successful verification
 */
export async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
  try {
    const emailContent = {
      to: email,
      subject: 'Welcome to SavionRay Content Lab!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to SavionRay Content Lab!</h2>
          <p>Hi ${name},</p>
          <p>Great news! Your email has been verified and your account is now active.</p>
          <p>You can now:</p>
          <ul>
            <li>Create and manage content ideas</li>
            <li>Collaborate with your team</li>
            <li>Track content performance</li>
            <li>Access all our features</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/dashboard" 
               style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Go to Dashboard
            </a>
          </div>
          <p>If you have any questions, feel free to reach out to our support team.</p>
          <p>Happy creating!</p>
          <p>The SavionRay Team</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            This email was sent from SavionRay Content Lab. Please do not reply to this email.
          </p>
        </div>
      `
    }

    await sendEmail(emailContent)
    return true
  } catch (error) {
    console.error('Error sending welcome email:', error)
    return false
  }
} 