'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { DraftStatus } from '@prisma/client'

interface ApprovalButtonProps {
  draftId: string
  currentStatus: DraftStatus
  onSuccess?: () => void
}

export default function ApprovalButton({ draftId, currentStatus, onSuccess }: ApprovalButtonProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSchedule, setShowSchedule] = useState(false)
  const [scheduledDate, setScheduledDate] = useState<string>('')
  const [error, setError] = useState('')

  if (currentStatus === 'APPROVED') {
    return null
  }

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.id) return

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch(`/api/drafts/${draftId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scheduledDate: scheduledDate || undefined,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to approve draft')
      }

      onSuccess?.()
      router.refresh()
    } catch (error) {
      console.error('Failed to approve draft:', error)
      setError('Failed to approve draft. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setShowSchedule(!showSchedule)}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          {showSchedule ? 'Hide Schedule Options' : 'Schedule Post'}
        </button>

        <button
          onClick={handleApprove}
          disabled={isSubmitting || (showSchedule && !scheduledDate)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Approving...' : 'Approve Draft'}
        </button>
      </div>

      {showSchedule && (
        <div className="mt-4">
          <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700">
            Schedule Date
          </label>
          <div className="mt-1">
            <input
              type="datetime-local"
              id="scheduledDate"
              name="scheduledDate"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Leave empty to publish immediately upon approval
          </p>
        </div>
      )}
    </div>
  )
} 