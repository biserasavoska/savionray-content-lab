import {
  IDEA_STATUS,
  DRAFT_STATUS,
  SCHEDULE_STATUS,
  MEDIA_TYPE,
  CONTENT_TYPE,
  DELIVERY_PLAN_STATUS,
  DELIVERY_ITEM_STATUS,
  USER_ROLE,
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
 * ENUM VALIDATION UTILITIES
 * 
 * Simple runtime validation for enum values.
 * Use these functions to validate enum values before using them in database operations.
 */

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate if a string is a valid IdeaStatus
 */
export function validateIdeaStatus(status: string): status is IdeaStatus {
  return Object.values(IDEA_STATUS).includes(status as IdeaStatus)
}

/**
 * Validate if a string is a valid DraftStatus
 */
export function validateDraftStatus(status: string): status is DraftStatus {
  return Object.values(DRAFT_STATUS).includes(status as DraftStatus)
}

/**
 * Validate if a string is a valid ScheduleStatus
 */
export function validateScheduleStatus(status: string): status is ScheduleStatus {
  return Object.values(SCHEDULE_STATUS).includes(status as ScheduleStatus)
}

/**
 * Validate if a string is a valid MediaType
 */
export function validateMediaType(type: string): type is MediaType {
  return Object.values(MEDIA_TYPE).includes(type as MediaType)
}

/**
 * Validate if a string is a valid ContentType
 */
export function validateContentType(type: string): type is ContentType {
  return Object.values(CONTENT_TYPE).includes(type as ContentType)
}

/**
 * Validate if a string is a valid UserRole
 */
export function validateUserRole(role: string): role is UserRole {
  return Object.values(USER_ROLE).includes(role as UserRole)
}

/**
 * Validate if a string is a valid DeliveryPlanStatus
 */
export function validateDeliveryPlanStatus(status: string): status is DeliveryPlanStatus {
  return Object.values(DELIVERY_PLAN_STATUS).includes(status as DeliveryPlanStatus)
}

/**
 * Validate if a string is a valid DeliveryItemStatus
 */
export function validateDeliveryItemStatus(status: string): status is DeliveryItemStatus {
  return Object.values(DELIVERY_ITEM_STATUS).includes(status as DeliveryItemStatus)
}

// ============================================================================
// BULK VALIDATION
// ============================================================================

/**
 * Validate multiple enum values at once
 */
export function validateEnumValues(values: Record<string, string>): {
  valid: Record<string, string>
  invalid: Record<string, string>
  errors: string[]
} {
  const valid: Record<string, string> = {}
  const invalid: Record<string, string> = {}
  const errors: string[] = []

  for (const [key, value] of Object.entries(values)) {
    let isValid = false

    // Check against all enum types
    if (validateIdeaStatus(value)) isValid = true
    else if (validateDraftStatus(value)) isValid = true
    else if (validateScheduleStatus(value)) isValid = true
    else if (validateMediaType(value)) isValid = true
    else if (validateContentType(value)) isValid = true
    else if (validateUserRole(value)) isValid = true
    else if (validateDeliveryPlanStatus(value)) isValid = true
    else if (validateDeliveryItemStatus(value)) isValid = true

    if (isValid) {
      valid[key] = value
    } else {
      invalid[key] = value
      errors.push(`Invalid enum value for ${key}: ${value}`)
    }
  }

  return { valid, invalid, errors }
}

// ============================================================================
// API VALIDATION HELPERS
// ============================================================================

/**
 * Validate enum value for API requests
 */
export function validateApiEnumValue(
  value: string,
  enumType: 'ideaStatus' | 'draftStatus' | 'scheduleStatus' | 'mediaType' | 'contentType' | 'userRole' | 'deliveryPlanStatus' | 'deliveryItemStatus'
): { isValid: boolean; error?: string } {
  let isValid = false

  switch (enumType) {
    case 'ideaStatus':
      isValid = validateIdeaStatus(value)
      break
    case 'draftStatus':
      isValid = validateDraftStatus(value)
      break
    case 'scheduleStatus':
      isValid = validateScheduleStatus(value)
      break
    case 'mediaType':
      isValid = validateMediaType(value)
      break
    case 'contentType':
      isValid = validateContentType(value)
      break
    case 'userRole':
      isValid = validateUserRole(value)
      break
    case 'deliveryPlanStatus':
      isValid = validateDeliveryPlanStatus(value)
      break
    case 'deliveryItemStatus':
      isValid = validateDeliveryItemStatus(value)
      break
  }

  return {
    isValid,
    error: isValid ? undefined : `Invalid ${enumType} value: ${value}`
  }
}

/**
 * Get all valid enum values for a specific enum type
 */
export function getValidEnumValues(
  enumType: 'ideaStatus' | 'draftStatus' | 'scheduleStatus' | 'mediaType' | 'contentType' | 'userRole' | 'deliveryPlanStatus' | 'deliveryItemStatus'
): string[] {
  switch (enumType) {
    case 'ideaStatus':
      return Object.values(IDEA_STATUS)
    case 'draftStatus':
      return Object.values(DRAFT_STATUS)
    case 'scheduleStatus':
      return Object.values(SCHEDULE_STATUS)
    case 'mediaType':
      return Object.values(MEDIA_TYPE)
    case 'contentType':
      return Object.values(CONTENT_TYPE)
    case 'userRole':
      return Object.values(USER_ROLE)
    case 'deliveryPlanStatus':
      return Object.values(DELIVERY_PLAN_STATUS)
    case 'deliveryItemStatus':
      return Object.values(DELIVERY_ITEM_STATUS)
    default:
      return []
  }
}

// ============================================================================
// DATABASE VALIDATION HELPERS
// ============================================================================

/**
 * Validate enum values before database operations
 */
export function validateDatabaseEnums(data: Record<string, any>): {
  isValid: boolean
  errors: string[]
  sanitizedData: Record<string, any>
} {
  const errors: string[] = []
  const sanitizedData: Record<string, any> = { ...data }

  // Validate status fields
  if (data.status) {
    const statusValidation = validateApiEnumValue(data.status, 'draftStatus')
    if (!statusValidation.isValid) {
      errors.push(statusValidation.error!)
    }
  }

  // Validate contentType fields
  if (data.contentType) {
    const contentTypeValidation = validateApiEnumValue(data.contentType, 'contentType')
    if (!contentTypeValidation.isValid) {
      errors.push(contentTypeValidation.error!)
    }
  }

  // Validate mediaType fields
  if (data.mediaType) {
    const mediaTypeValidation = validateApiEnumValue(data.mediaType, 'mediaType')
    if (!mediaTypeValidation.isValid) {
      errors.push(mediaTypeValidation.error!)
    }
  }

  // Validate role fields
  if (data.role) {
    const roleValidation = validateApiEnumValue(data.role, 'userRole')
    if (!roleValidation.isValid) {
      errors.push(roleValidation.error!)
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData
  }
} 