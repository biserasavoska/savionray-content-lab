'use server'

import { IdeaStatus } from '@prisma/client'
import nodemailer from 'nodemailer'

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  })

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
    })
  } catch (error) {
    console.error('Failed to send email:', error)
    throw error
  }
}

export async function getStatusChangeEmailContent(
  ideaTitle: string,
  newStatus: IdeaStatus,
  feedbackUrl: string
) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Content Idea Status Update</h2>
      <p>The status of your content idea "${ideaTitle}" has been updated to ${newStatus.toLowerCase().replace(/_/g, ' ')}.</p>
      <p>You can view the details and any feedback by clicking the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${feedbackUrl}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
          View Idea
        </a>
      </div>
      <p>Best regards,<br>Savion Ray Content Lab Team</p>
    </div>
  `
}

export async function getFeedbackEmailContent(
  ideaTitle: string,
  feedbackUrl: string
) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>New Feedback on Your Content Idea</h2>
      <p>You have received new feedback on your content idea "${ideaTitle}".</p>
      <p>Click the button below to view the feedback:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${feedbackUrl}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
          View Feedback
        </a>
      </div>
      <p>Best regards,<br>Savion Ray Content Lab Team</p>
    </div>
  `
} 