import { UserRole } from '@/types/content'

export const PERMISSIONS = {
  CREATIVE: {
    canCreateContent: true,
    canApproveIdeas: false,
    canViewAllContent: true,
    canEditOwnContent: true,
    canDeleteOwnContent: true,
    canViewDashboard: true,
  },
  CLIENT: {
    canCreateContent: false,
    canApproveIdeas: true,
    canViewAllContent: true,
    canEditOwnContent: false,
    canDeleteOwnContent: false,
    canViewDashboard: true,
  },
  ADMIN: {
    canCreateContent: true,
    canApproveIdeas: true,
    canViewAllContent: true,
    canEditOwnContent: true,
    canDeleteOwnContent: true,
    canViewDashboard: true,
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
    default:
      return false
  }
} 