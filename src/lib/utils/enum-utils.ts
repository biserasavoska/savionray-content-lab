import {
  IDEA_STATUS,
  DRAFT_STATUS,
  SCHEDULE_STATUS,
  MEDIA_TYPE,
  CONTENT_TYPE,
  DELIVERY_PLAN_STATUS,
  DELIVERY_ITEM_STATUS,
  USER_ROLE,
  CONTENT_ITEM_STATUS,
  WORKFLOW_STAGE,
  type IdeaStatus,
  type DraftStatus,
  type ScheduleStatus,
  type MediaType,
  type ContentType,
  type DeliveryPlanStatus,
  type DeliveryItemStatus,
  type UserRole
} from './enum-constants'

/**
 * ENUM UTILITIES - Centralized enum operations and helpers
 * 
 * This file provides utilities for working with enums consistently across the application.
 * Use these functions instead of hardcoding enum strings or creating custom validation.
 */

// ============================================================================
// STATUS HELPERS
// ============================================================================

/**
 * Get the display label for any status enum
 */
export function getStatusLabel(status: string): string {
  // Idea Status Labels
  if (isValidIdeaStatus(status)) {
    switch (status) {
      case IDEA_STATUS.PENDING: return 'Pending'
      case IDEA_STATUS.APPROVED: return 'Approved'
      case IDEA_STATUS.REJECTED: return 'Rejected'
      default: return 'Unknown'
    }
  }

  // Draft Status Labels
  if (isValidDraftStatus(status)) {
    switch (status) {
      case DRAFT_STATUS.DRAFT: return 'Draft'
      case DRAFT_STATUS.AWAITING_FEEDBACK: return 'Awaiting Feedback'
      case DRAFT_STATUS.AWAITING_REVISION: return 'Awaiting Revision'
      case DRAFT_STATUS.APPROVED: return 'Approved'
      case DRAFT_STATUS.REJECTED: return 'Rejected'
      case DRAFT_STATUS.PUBLISHED: return 'Published'
      default: return 'Unknown'
    }
  }

  // Schedule Status Labels
  if (isValidScheduleStatus(status)) {
    switch (status) {
      case SCHEDULE_STATUS.SCHEDULED: return 'Scheduled'
      case SCHEDULE_STATUS.PUBLISHED: return 'Published'
      case SCHEDULE_STATUS.FAILED: return 'Failed'
      default: return 'Unknown'
    }
  }

  return 'Unknown'
}

/**
 * Get the CSS classes for status badges
 */
export function getStatusBadgeClasses(status: string): string {
  // Idea Status Classes
  if (isValidIdeaStatus(status)) {
    switch (status) {
      case IDEA_STATUS.PENDING: return 'bg-yellow-100 text-yellow-800'
      case IDEA_STATUS.APPROVED: return 'bg-green-100 text-green-800'
      case IDEA_STATUS.REJECTED: return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Draft Status Classes
  if (isValidDraftStatus(status)) {
    switch (status) {
      case DRAFT_STATUS.DRAFT: return 'bg-yellow-100 text-yellow-800'
      case DRAFT_STATUS.AWAITING_FEEDBACK: return 'bg-blue-100 text-blue-800'
      case DRAFT_STATUS.AWAITING_REVISION: return 'bg-orange-100 text-orange-800'
      case DRAFT_STATUS.APPROVED: return 'bg-green-100 text-green-800'
      case DRAFT_STATUS.REJECTED: return 'bg-red-100 text-red-800'
      case DRAFT_STATUS.PUBLISHED: return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Schedule Status Classes
  if (isValidScheduleStatus(status)) {
    switch (status) {
      case SCHEDULE_STATUS.SCHEDULED: return 'bg-yellow-100 text-yellow-800'
      case SCHEDULE_STATUS.PUBLISHED: return 'bg-green-100 text-green-800'
      case SCHEDULE_STATUS.FAILED: return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return 'bg-gray-100 text-gray-800'
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate if a string is a valid IdeaStatus
 */
export function isValidIdeaStatus(status: string): status is IdeaStatus {
  return Object.values(IDEA_STATUS).includes(status as IdeaStatus)
}

/**
 * Validate if a string is a valid DraftStatus
 */
export function isValidDraftStatus(status: string): status is DraftStatus {
  return Object.values(DRAFT_STATUS).includes(status as DraftStatus)
}

/**
 * Validate if a string is a valid ScheduleStatus
 */
export function isValidScheduleStatus(status: string): status is ScheduleStatus {
  return Object.values(SCHEDULE_STATUS).includes(status as ScheduleStatus)
}

/**
 * Validate if a string is a valid MediaType
 */
export function isValidMediaType(type: string): type is MediaType {
  return Object.values(MEDIA_TYPE).includes(type as MediaType)
}

/**
 * Validate if a string is a valid ContentType
 */
export function isValidContentType(type: string): type is ContentType {
  return Object.values(CONTENT_TYPE).includes(type as ContentType)
}

/**
 * Validate if a string is a valid UserRole
 */
export function isValidUserRole(role: string): role is UserRole {
  return Object.values(USER_ROLE).includes(role as UserRole)
}

// ============================================================================
// STATUS TRANSITION HELPERS
// ============================================================================

/**
 * Check if a status transition is valid
 */
export function isValidStatusTransition(
  currentStatus: string,
  newStatus: string,
  userRole: string
): boolean {
  // Idea status transitions
  if (isValidIdeaStatus(currentStatus) && isValidIdeaStatus(newStatus)) {
    // Only clients can approve/reject ideas
    if (userRole === USER_ROLE.CLIENT) {
      return newStatus === IDEA_STATUS.APPROVED || newStatus === IDEA_STATUS.REJECTED
    }
    return false
  }

  // Draft status transitions
  if (isValidDraftStatus(currentStatus) && isValidDraftStatus(newStatus)) {
    const validTransitions: Record<string, string[]> = {
      [DRAFT_STATUS.DRAFT]: [DRAFT_STATUS.AWAITING_FEEDBACK, DRAFT_STATUS.REJECTED],
      [DRAFT_STATUS.AWAITING_FEEDBACK]: [DRAFT_STATUS.APPROVED, DRAFT_STATUS.AWAITING_REVISION, DRAFT_STATUS.REJECTED],
      [DRAFT_STATUS.AWAITING_REVISION]: [DRAFT_STATUS.AWAITING_FEEDBACK, DRAFT_STATUS.REJECTED],
      [DRAFT_STATUS.APPROVED]: [DRAFT_STATUS.PUBLISHED, DRAFT_STATUS.REJECTED],
      [DRAFT_STATUS.REJECTED]: [DRAFT_STATUS.DRAFT],
      [DRAFT_STATUS.PUBLISHED]: [] // Published is final
    }

    return validTransitions[currentStatus]?.includes(newStatus) || false
  }

  return false
}

/**
 * Get the next valid statuses for a current status
 */
export function getValidNextStatuses(
  currentStatus: string,
  userRole: string
): string[] {
  if (isValidDraftStatus(currentStatus)) {
    const validTransitions: Record<string, string[]> = {
      [DRAFT_STATUS.DRAFT]: [DRAFT_STATUS.AWAITING_FEEDBACK, DRAFT_STATUS.REJECTED],
      [DRAFT_STATUS.AWAITING_FEEDBACK]: [DRAFT_STATUS.APPROVED, DRAFT_STATUS.AWAITING_REVISION, DRAFT_STATUS.REJECTED],
      [DRAFT_STATUS.AWAITING_REVISION]: [DRAFT_STATUS.AWAITING_FEEDBACK, DRAFT_STATUS.REJECTED],
      [DRAFT_STATUS.APPROVED]: [DRAFT_STATUS.PUBLISHED, DRAFT_STATUS.REJECTED],
      [DRAFT_STATUS.REJECTED]: [DRAFT_STATUS.DRAFT],
      [DRAFT_STATUS.PUBLISHED]: []
    }

    return validTransitions[currentStatus] || []
  }

  if (isValidIdeaStatus(currentStatus) && userRole === USER_ROLE.CLIENT) {
    return [IDEA_STATUS.APPROVED, IDEA_STATUS.REJECTED]
  }

  return []
}

// ============================================================================
// ENUM CONSTANTS EXPORTS
// ============================================================================

// Re-export all enum constants for easy access
export {
  IDEA_STATUS,
  DRAFT_STATUS,
  SCHEDULE_STATUS,
  MEDIA_TYPE,
  CONTENT_TYPE,
  DELIVERY_PLAN_STATUS,
  DELIVERY_ITEM_STATUS,
  USER_ROLE,
  CONTENT_ITEM_STATUS,
  WORKFLOW_STAGE
}

// Re-export types
export type {
  IdeaStatus,
  DraftStatus,
  ScheduleStatus,
  MediaType,
  ContentType,
  DeliveryPlanStatus,
  DeliveryItemStatus,
  UserRole
} 