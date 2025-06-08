'use server'

import { createTransport } from 'nodemailer'
import { IdeaStatus } from '@prisma/client'

const transporter = createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL,
      to,
      subject,
      html,
    })
  } catch (error) {
    console.error('Failed to send email:', error)
    throw new Error('Failed to send email')
  }
}

export function getStatusChangeEmailContent(
  ideaTitle: string,
  newStatus: IdeaStatus,
  feedbackUrl: string
) {
  const statusDisplay = newStatus.replace(/_/g, ' ')
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Content Idea Status Update</h2>
      <p>Your content idea "${ideaTitle}" has been <strong>${statusDisplay}</strong>.</p>
      
      ${newStatus === 'APPROVED_BY_CLIENT' ? `
        <p>Great news! Your content idea has been approved. You can now proceed with creating the content.</p>
        <p>Click the button below to start working on your content:</p>
        <a href="${feedbackUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
          Create Content
        </a>
      ` : newStatus === 'REJECTED_BY_CLIENT' ? `
        <p>Your content idea needs some revisions. Please check the feedback provided and consider submitting a revised version.</p>
        <p>Click the button below to view the feedback:</p>
        <a href="${feedbackUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
          View Feedback
        </a>
      ` : ''}
      
      <p style="margin-top: 20px; color: #666;">
        This is an automated message from SavionRay Content Lab.
      </p>
    </div>
  `
}

export function getFeedbackEmailContent(
  ideaTitle: string,
  feedbackUrl: string
) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">New Feedback Received</h2>
      <p>You have received new feedback on your content idea "${ideaTitle}".</p>
      
      <p>Click the button below to view the feedback:</p>
      <a href="${feedbackUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
        View Feedback
      </a>
      
      <p style="margin-top: 20px; color: #666;">
        This is an automated message from SavionRay Content Lab.
      </p>
    </div>
  `
} 