'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { DraftStatus } from '@prisma/client'

interface ApprovalButtonProps {
  draftId: string
  currentStatus: DraftStatus
  onApprove: (draftId: string, status: DraftStatus) => Promise<void>
}

export default function ApprovalButton({
  draftId,
  currentStatus,
  onApprove,
}: ApprovalButtonProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [showSchedule, setShowSchedule] = useState(false)
  const [scheduledDate, setScheduledDate] = useState<string>('')
  const [error, setError] = useState('')

  if (currentStatus === DraftStatus.APPROVED_FOR_PUBLISHING) {
    return null
  }

  const handleApprove = async () => {
    setIsLoading(true)
    setError('')

    try {
      await onApprove(draftId, DraftStatus.APPROVED_FOR_PUBLISHING)
    } catch (err) {
      setError('Failed to approve draft')
    } finally {
      setIsLoading(false)
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
          disabled={isLoading || (showSchedule && !scheduledDate)}
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Approving...' : 'Approve'}
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