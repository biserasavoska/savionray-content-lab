'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { DraftStatus } from '@prisma/client'

import { isAdmin, isClient } from '@/lib/auth'

interface DraftActionsProps {
  draftId: string
  currentStatus: DraftStatus
  ideaId: string
}

export default function DraftActions({ draftId, currentStatus, ideaId }: DraftActionsProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!session || (!isAdmin(session) && !isClient(session))) {
    return null
  }

  const handleStatusUpdate = async (status: DraftStatus) => {
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch(`/api/drafts/${draftId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error('Failed to update draft status')
      }

      router.refresh()
    } catch (error) {
      console.error('Failed to update draft status:', error)
      setError('Failed to update draft status. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitFeedback = async (feedback: string) => {
    if (!feedback.trim()) return

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch(`/api/drafts/${draftId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment: feedback }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit feedback')
      }

      router.refresh()
    } catch (error) {
      console.error('Failed to submit feedback:', error)
      setError('Failed to submit feedback. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (currentStatus === DraftStatus.APPROVED) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Approved
      </span>
    )
  }

  if (currentStatus === DraftStatus.REJECTED) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-700">This draft has been rejected.</p>
      </div>
    )
  }

  if (isClient(session)) {
    return (
      <div className="space-y-4">
        <div className="flex space-x-4">
          <button
            onClick={() => handleStatusUpdate(DraftStatus.APPROVED)}
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Approving...' : 'Approve'}
          </button>
          <button
            onClick={() => handleStatusUpdate(DraftStatus.AWAITING_REVISION)}
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Requesting...' : 'Request Changes'}
          </button>
          <button
            onClick={() => handleStatusUpdate(DraftStatus.REJECTED)}
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Rejecting...' : 'Reject'}
          </button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    )
  }

  return null
} 