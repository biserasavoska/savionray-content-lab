import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import InvitationAcceptanceForm from './InvitationAcceptanceForm'

interface InvitationPageProps {
  params: { id: string }
}

export default async function InvitationPage({ params }: InvitationPageProps) {
  const session = await getServerSession(authOptions)
  const invitationId = params.id

  // Get invitation details
  const invitation = await prisma.organizationInvitation.findUnique({
    where: { id: invitationId },
    include: {
      organization: true,
      invitedByUser: {
        select: {
          name: true,
          email: true
        }
      }
    }
  })

  if (!invitation) {
    redirect('/auth/signin?error=invalid_invitation')
  }

  // Check if invitation is expired
  if (invitation.expiresAt < new Date()) {
    redirect('/auth/signin?error=expired_invitation')
  }

  // Check if invitation is already processed
  if (invitation.status !== 'PENDING') {
    redirect('/auth/signin?error=processed_invitation')
  }

  // If user is not authenticated, redirect to signin with invitation context
  if (!session) {
    redirect(`/auth/signin?invitation=${invitationId}`)
  }

  // Check if user email matches invitation email
  if (session.user.email !== invitation.email) {
    redirect('/auth/signin?error=email_mismatch')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Join {invitation.organization.name}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            You've been invited to join this organization
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <InvitationAcceptanceForm 
            invitation={invitation}
            userEmail={session.user.email!}
          />
        </div>
      </div>
    </div>
  )
} 