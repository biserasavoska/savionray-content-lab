'use client'

import { Feedback, User } from '@prisma/client'
import { formatDistanceToNow } from 'date-fns'

interface FeedbackListProps {
  feedbacks: (Feedback & {
    User: Pick<User, 'name' | 'email'>
  })[]
}

export default function FeedbackList({ feedbacks }: FeedbackListProps) {
  if (feedbacks.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500">No feedback yet.</p>
      </div>
    )
  }

  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {feedbacks.map((feedback, idx) => (
          <li key={feedback.id}>
            <div className="relative pb-8">
              {idx !== feedbacks.length - 1 ? (
                <span
                  className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex items-start space-x-3">
                <div className="relative">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 ring-8 ring-white">
                    <span className="text-sm font-medium text-red-600">
                      {(feedback.User.name || feedback.User.email || '?')[0].toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div>
                    <div className="text-sm">
                                              <span className="font-medium text-gray-900">
                          {feedback.User.name || feedback.User.email}
                        </span>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500">
                      {formatDistanceToNow(new Date(feedback.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="mt-2 text-sm text-gray-700">
                    <p>{feedback.comment}</p>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
} 