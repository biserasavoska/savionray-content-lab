/**
 * ENUM CONSTANTS - CENTRALIZED ENUM DEFINITIONS
 * 
 * IMPORTANT: This file contains all valid enum values used throughout the application.
 * When adding new enum values, update this file first, then update the Prisma schema.
 * 
 * This prevents enum mismatches between the database and application code.
 * 
 * USAGE:
 * - Import these constants instead of hardcoding enum strings
 * - Use these in queries, filters, and status checks
 * - Ensures consistency across the entire application
 */

// Idea Status Enums
export const IDEA_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED', 
  REJECTED: 'REJECTED'
} as const

export type IdeaStatus = typeof IDEA_STATUS[keyof typeof IDEA_STATUS]

// Draft Status Enums  
export const DRAFT_STATUS = {
  DRAFT: 'DRAFT',
  AWAITING_FEEDBACK: 'AWAITING_FEEDBACK',
  AWAITING_REVISION: 'AWAITING_REVISION',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  PUBLISHED: 'PUBLISHED',
} as const

export type DraftStatus = typeof DRAFT_STATUS[keyof typeof DRAFT_STATUS]

// Schedule Status Enums
export const SCHEDULE_STATUS = {
  SCHEDULED: 'SCHEDULED',
  PUBLISHED: 'PUBLISHED',
  FAILED: 'FAILED'
} as const

export type ScheduleStatus = typeof SCHEDULE_STATUS[keyof typeof SCHEDULE_STATUS]

// Media Type Enums
export const MEDIA_TYPE = {
  PHOTO: 'PHOTO',
  GRAPH_OR_INFOGRAPHIC: 'GRAPH_OR_INFOGRAPHIC',
  VIDEO: 'VIDEO',
  SOCIAL_CARD: 'SOCIAL_CARD',
  POLL: 'POLL',
  CAROUSEL: 'CAROUSEL'
} as const

export type MediaType = typeof MEDIA_TYPE[keyof typeof MEDIA_TYPE]

// Content Type Enums
export const CONTENT_TYPE = {
  NEWSLETTER: 'NEWSLETTER',
  BLOG_POST: 'BLOG_POST',
  SOCIAL_MEDIA_POST: 'SOCIAL_MEDIA_POST',
  WEBSITE_COPY: 'WEBSITE_COPY',
  EMAIL_CAMPAIGN: 'EMAIL_CAMPAIGN'
} as const

export type ContentType = typeof CONTENT_TYPE[keyof typeof CONTENT_TYPE]

// Delivery Plan Status Enums
export const DELIVERY_PLAN_STATUS = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
} as const

export type DeliveryPlanStatus = typeof DELIVERY_PLAN_STATUS[keyof typeof DELIVERY_PLAN_STATUS]

// Delivery Item Status Enums
export const DELIVERY_ITEM_STATUS = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  REVIEW: 'REVIEW',
  APPROVED: 'APPROVED',
  DELIVERED: 'DELIVERED'
} as const

export type DeliveryItemStatus = typeof DELIVERY_ITEM_STATUS[keyof typeof DELIVERY_ITEM_STATUS]

// User Role Enums
export const USER_ROLE = {
  CREATIVE: 'CREATIVE',
  CLIENT: 'CLIENT',
  ADMIN: 'ADMIN'
} as const

export type UserRole = typeof USER_ROLE[keyof typeof USER_ROLE]

// NEW: Unified Content Item Status
export const CONTENT_ITEM_STATUS = {
  IDEA: 'IDEA',
  CONTENT_REVIEW: 'CONTENT_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  PUBLISHED: 'PUBLISHED',
} as const

// NEW: Workflow Stage
export const WORKFLOW_STAGE = {
  IDEA: 'IDEA',
  CONTENT_REVIEW: 'CONTENT_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  PUBLISHED: 'PUBLISHED',
} as const

// Helper functions for common enum operations
export const getIdeaStatusValues = () => Object.values(IDEA_STATUS)
export const getDraftStatusValues = () => Object.values(DRAFT_STATUS)
export const getScheduleStatusValues = () => Object.values(SCHEDULE_STATUS)
export const getMediaTypeValues = () => Object.values(MEDIA_TYPE)
export const getContentTypeValues = () => Object.values(CONTENT_TYPE)
export const getDeliveryPlanStatusValues = () => Object.values(DELIVERY_PLAN_STATUS)
export const getDeliveryItemStatusValues = () => Object.values(DELIVERY_ITEM_STATUS)
export const getUserRoleValues = () => Object.values(USER_ROLE)

// Validation helpers
export const isValidIdeaStatus = (status: string): status is IdeaStatus => 
  Object.values(IDEA_STATUS).includes(status as IdeaStatus)

export const isValidDraftStatus = (status: string): status is DraftStatus => 
  Object.values(DRAFT_STATUS).includes(status as DraftStatus)

export const isValidScheduleStatus = (status: string): status is ScheduleStatus => 
  Object.values(SCHEDULE_STATUS).includes(status as ScheduleStatus)

export const isValidMediaType = (type: string): type is MediaType => 
  Object.values(MEDIA_TYPE).includes(type as MediaType)

export const isValidContentType = (type: string): type is ContentType => 
  Object.values(CONTENT_TYPE).includes(type as ContentType)

export const isValidDeliveryPlanStatus = (status: string): status is DeliveryPlanStatus => 
  Object.values(DELIVERY_PLAN_STATUS).includes(status as DeliveryPlanStatus)

export const isValidDeliveryItemStatus = (status: string): status is DeliveryItemStatus => 
  Object.values(DELIVERY_ITEM_STATUS).includes(status as DeliveryItemStatus)

export const isValidUserRole = (role: string): role is UserRole => 
  Object.values(USER_ROLE).includes(role as UserRole) 