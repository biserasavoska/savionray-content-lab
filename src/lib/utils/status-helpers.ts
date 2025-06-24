import { ContentStatus, IdeaStatus } from '@/types/content'

export const IDEA_STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  APPROVED: 'bg-green-100 text-green-800 border-green-200',
  REJECTED: 'bg-red-100 text-red-800 border-red-200',
} as const

export const CONTENT_STATUS_COLORS = {
  DRAFT: 'bg-gray-100 text-gray-800 border-gray-200',
  AWAITING_FEEDBACK: 'bg-blue-100 text-blue-800 border-blue-200',
  AWAITING_REVISION: 'bg-orange-100 text-orange-800 border-orange-200',
  APPROVED: 'bg-green-100 text-green-800 border-green-200',
  REJECTED: 'bg-red-100 text-red-800 border-red-200',
  PUBLISHED: 'bg-purple-100 text-purple-800 border-purple-200',
} as const

export const IDEA_STATUS_LABELS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
} as const

export const CONTENT_STATUS_LABELS = {
  DRAFT: 'Draft',
  AWAITING_FEEDBACK: 'Awaiting Feedback',
  AWAITING_REVISION: 'Awaiting Revision',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  PUBLISHED: 'Published',
} as const

export function getStatusColor(status: IdeaStatus | ContentStatus): string {
  if (isIdeaStatus(status)) {
    return IDEA_STATUS_COLORS[status] || IDEA_STATUS_COLORS.PENDING
  }
  return CONTENT_STATUS_COLORS[status] || CONTENT_STATUS_COLORS.DRAFT
}

export function getStatusLabel(status: IdeaStatus | ContentStatus): string {
  if (isIdeaStatus(status)) {
    return IDEA_STATUS_LABELS[status] || 'Unknown'
  }
  return CONTENT_STATUS_LABELS[status] || 'Unknown'
}

export function isIdeaStatus(status: string): status is IdeaStatus {
  return ['PENDING', 'APPROVED', 'REJECTED'].includes(status)
}

export function isContentStatus(status: string): status is ContentStatus {
  return ['DRAFT', 'AWAITING_FEEDBACK', 'AWAITING_REVISION', 'APPROVED', 'REJECTED', 'PUBLISHED'].includes(status)
} 