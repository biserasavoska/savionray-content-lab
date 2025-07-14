import { prisma } from '../prisma';

import { logError, createDatabaseError, createAuthorizationError } from './error-handling';

import { SecurityContext, QueryOptions } from '@/lib/types/security';

/**
 * Database Security Utilities for Multi-Tenant Data Isolation
 * 
 * This module provides security utilities to ensure proper organization-based
 * access control and prevent data leakage across tenants.
 */

/**
 * Validates that a user has access to a specific organization
 */
export async function validateOrganizationAccess(
  userId: string,
  organizationId: string
): Promise<boolean> {
  try {
    const membership = await prisma.organizationUser.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
      select: {
        isActive: true,
        role: true,
      },
    });

    if (!membership || !membership.isActive) {
      return false;
    }

    return true;
  } catch (error) {
    logError(createDatabaseError(
      'Failed to validate organization access',
      { userId, organizationId, error: error instanceof Error ? error.message : 'Unknown error' }
    ));
    return false;
  }
}

/**
 * Creates a secure organization filter for Prisma queries
 */
export function createSecureOrgFilter(organizationId: string) {
  return {
    organizationId,
  };
}

/**
 * Creates a secure user-organization filter for Prisma queries
 */
export function createSecureUserOrgFilter(userId: string, organizationId: string) {
  return {
    AND: [
      { organizationId },
      {
        OR: [
          { createdById: userId },
          { assignedToId: userId },
        ],
      },
    ],
  };
}

/**
 * Validates that content belongs to the user's organization
 */
export async function validateContentOwnership(
  contentId: string,
  contentType: 'idea' | 'draft' | 'content',
  securityContext: SecurityContext
): Promise<boolean> {
  try {
    const { userId, organizationId } = securityContext;

    // Validate organization access first
    const hasOrgAccess = await validateOrganizationAccess(userId, organizationId);
    if (!hasOrgAccess) {
      return false;
    }

    // Check content ownership based on type
    switch (contentType) {
      case 'idea': {
        const idea = await prisma.idea.findFirst({
          where: {
            id: contentId,
            organizationId,
          },
          select: { id: true },
        });
        return !!idea;
      }

      case 'draft': {
        const draft = await prisma.contentDraft.findFirst({
          where: {
            id: contentId,
            organizationId,
          },
          select: { id: true },
        });
        return !!draft;
      }

      case 'content': {
        const content = await prisma.contentItem.findFirst({
          where: {
            id: contentId,
            organizationId,
          },
          select: { id: true },
        });
        return !!content;
      }

      default:
        return false;
    }
  } catch (error) {
    logError(createDatabaseError(
      'Failed to validate content ownership',
      { contentId, contentType, userId: securityContext.userId, organizationId: securityContext.organizationId, error: error instanceof Error ? error.message : 'Unknown error' }
    ));
    return false;
  }
}

/**
 * Creates a secure query with organization context
 */
export function createSecureQuery(
  baseQuery: any,
  securityContext: SecurityContext,
  options: QueryOptions = {}
) {
  const { organizationId, userId, isSuperAdmin } = securityContext;
  const { includeDeleted = false, includeInactive = false } = options;

  // Super admin bypass for organization filtering (but still log access)
  if (isSuperAdmin) {
    logError(createAuthorizationError(
      'Super admin access detected',
      { userId, organizationId, query: JSON.stringify(baseQuery) }
    ));
    return baseQuery;
  }

  // Add organization filter
  const secureQuery = {
    ...baseQuery,
    where: {
      ...baseQuery.where,
      organizationId,
    },
  };

  // Add active status filter if not including inactive
  if (!includeInactive) {
    secureQuery.where = {
      ...secureQuery.where,
      ...(secureQuery.where.organizationId && {
        organization: {
          users: {
            some: {
              userId,
              isActive: true,
            },
          },
        },
      }),
    };
  }

  return secureQuery;
}

/**
 * Validates database query for security compliance
 */
export function validateQuerySecurity(query: any, securityContext: SecurityContext): boolean {
  try {
    // Check for organization filter
    if (!query.where?.organizationId && !securityContext.isSuperAdmin) {
      logError(createAuthorizationError(
        'Missing organization filter in query',
        { userId: securityContext.userId, query: JSON.stringify(query) }
      ));
      return false;
    }

    // Check for potential SQL injection patterns
    const queryStr = JSON.stringify(query);
    const dangerousPatterns = [
      /union\s+select/i,
      /drop\s+table/i,
      /delete\s+from/i,
      /update\s+.*\s+set/i,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(queryStr)) {
        logError(createDatabaseError(
          'Potential SQL injection detected',
          { userId: securityContext.userId, query: queryStr, pattern: pattern.source }
        ));
        return false;
      }
    }

    return true;
  } catch (error) {
    logError(createDatabaseError(
      'Failed to validate query security',
      { userId: securityContext.userId, error: error instanceof Error ? error.message : 'Unknown error' }
    ));
    return false;
  }
}

/**
 * Creates a secure pagination object
 */
export function createSecurePagination(page: number = 1, limit: number = 10) {
  const maxLimit = 100; // Prevent excessive data retrieval
  const safeLimit = Math.min(limit, maxLimit);
  const safePage = Math.max(page, 1);
  
  return {
    skip: (safePage - 1) * safeLimit,
    take: safeLimit,
  };
}

/**
 * Logs database access for audit purposes
 */
export function logDatabaseAccess(
  operation: string,
  table: string,
  securityContext: SecurityContext,
  query?: any
) {
  logError(createDatabaseError(
    'Database access logged',
    { operation, table, userId: securityContext.userId, organizationId: securityContext.organizationId, userEmail: securityContext.userEmail, query: query ? JSON.stringify(query) : undefined }
  ));
}

/**
 * Validates organization ID format
 */
export function validateOrganizationId(organizationId: string): boolean {
  // Check if organization ID follows expected format (cuid)
  const cuidPattern = /^c[a-z0-9]{24}$/;
  return cuidPattern.test(organizationId);
}

/**
 * Sanitizes organization ID for database queries
 */
export function sanitizeOrganizationId(organizationId: string): string | null {
  if (!validateOrganizationId(organizationId)) {
    return null;
  }
  return organizationId;
}

const databaseSecurity = {
  validateOrganizationAccess,
  createSecureOrgFilter,
  createSecureUserOrgFilter,
  validateContentOwnership,
  createSecureQuery,
  validateQuerySecurity,
  createSecurePagination,
  logDatabaseAccess,
  validateOrganizationId,
  sanitizeOrganizationId,
};

export default databaseSecurity; 