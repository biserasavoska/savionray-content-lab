/**
 * Unified Security Types for Multi-Tenant Data Isolation
 * 
 * This module provides centralized type definitions for all security-related
 * functionality across the application.
 */

export interface SecurityContext {
  userId: string;
  organizationId: string;
  userEmail: string;
  isSuperAdmin: boolean;
  userRole: string;
  organizationRole: string;
  permissions: string[];
}

export interface OrganizationContext {
  organizationId: string;
  userId: string;
  userRole: string;
  organizationRole: string;
  userEmail?: string;
  isSuperAdmin?: boolean;
  permissions?: string[];
}

export interface SecurityOptions {
  requireAuth?: boolean;
  requireOrgContext?: boolean;
  requireRole?: string[];
  allowSuperAdmin?: boolean;
  validateQueries?: boolean;
  logAccess?: boolean;
}

export interface QueryOptions {
  includeDeleted?: boolean;
  includeInactive?: boolean;
  limit?: number;
  offset?: number;
}

export interface SecurityAuditLog {
  timestamp: Date;
  userId: string;
  userEmail: string;
  organizationId: string;
  action: string;
  resource?: string;
  resourceId?: string;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  identifier?: string;
}

export interface SecurityValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface SecurityEvent {
  type: string;
  userId: string;
  organizationId: string;
  timestamp: Date;
  details: Record<string, any>;
} 