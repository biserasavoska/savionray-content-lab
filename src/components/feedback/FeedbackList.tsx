'use client'

import { formatDistanceToNow } from 'date-fns'

interface FeedbackItem {
  id: string
  comment: string
  rating: number
  category: string
  priority: string
  actionable: boolean
  createdAt: string | Date
  User: {
    name: string | null
    email: string | null
  }
}

interface FeedbackListProps {
  feedbacks: FeedbackItem[]
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
                  <div className="flex items-center justify-between">
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
                    <div className="flex items-center space-x-2">
                      {/* Rating */}
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`text-sm ${
                              star <= feedback.rating
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      {/* Priority Badge */}
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          feedback.priority === 'high'
                            ? 'bg-red-100 text-red-800'
                            : feedback.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {feedback.priority}
                      </span>
                      {/* Actionable Badge */}
                      {feedback.actionable && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Actionable
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Category */}
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {feedback.category}
                    </span>
                  </div>
                  
                  {/* Comment */}
                  <div className="mt-3 text-sm text-gray-700">
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