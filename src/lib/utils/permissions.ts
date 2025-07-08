import { UserRole } from '@/types/content'

export const PERMISSIONS = {
  CREATIVE: {
    canCreateContent: true,
    canApproveIdeas: false,
    canViewAllContent: true,
    canEditOwnContent: true,
    canDeleteOwnContent: true,
    canViewDashboard: true,
    canProvideFeedback: true,
    canViewOrganizationData: true,
    canManageOrganization: false,
  },
  CLIENT: {
    canCreateContent: false,
    canApproveIdeas: true,
    canViewAllContent: true,
    canEditOwnContent: false,
    canDeleteOwnContent: false,
    canViewDashboard: true,
    canProvideFeedback: true,
    canViewOrganizationData: true,
    canManageOrganization: false,
  },
  ADMIN: {
    canCreateContent: true,
    canApproveIdeas: true,
    canViewAllContent: true,
    canEditOwnContent: true,
    canDeleteOwnContent: true,
    canViewDashboard: true,
    canProvideFeedback: true,
    canViewOrganizationData: true,
    canManageOrganization: true,
  },
} as const

export function hasPermission(userRole: UserRole, permission: keyof typeof PERMISSIONS.CREATIVE): boolean {
  return PERMISSIONS[userRole]?.[permission] ?? false
}

export function canUserAccess(userRole: UserRole, feature: string): boolean {
  switch (feature) {
    case 'create-content':
      return hasPermission(userRole, 'canCreateContent')
    case 'approve-ideas':
      return hasPermission(userRole, 'canApproveIdeas')
    case 'edit-content':
      return hasPermission(userRole, 'canEditOwnContent')
    case 'delete-content':
      return hasPermission(userRole, 'canDeleteOwnContent')
    case 'view-dashboard':
      return hasPermission(userRole, 'canViewDashboard')
    case 'provide-feedback':
      return hasPermission(userRole, 'canProvideFeedback')
    case 'view-organization-data':
      return hasPermission(userRole, 'canViewOrganizationData')
    case 'manage-organization':
      return hasPermission(userRole, 'canManageOrganization')
    default:
      return false
  }
}

/**
 * Check if user has access to organization-scoped data
 * This ensures users can only access data from their own organization
 */
export function hasOrganizationAccess(userOrganizationId: string, resourceOrganizationId: string): boolean {
  return userOrganizationId === resourceOrganizationId
}

/**
 * Check if user can provide feedback on content
 */
export function canProvideFeedback(userRole: UserRole): boolean {
  return hasPermission(userRole, 'canProvideFeedback')
}

/**
 * Check if user can view organization data
 */
export function canViewOrganizationData(userRole: UserRole): boolean {
  return hasPermission(userRole, 'canViewOrganizationData')
} 