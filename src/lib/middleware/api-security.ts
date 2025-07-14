import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';
import { 
  validateOrganizationAccess, 
  createSecureQuery, 
  validateQuerySecurity,
  logDatabaseAccess
} from '@/lib/utils/database-security';
import { createAuthenticationError, createAuthorizationError } from '@/lib/utils/error-handling';
import { SecurityContext, SecurityOptions } from '@/lib/types/security';

/**
 * API Security Middleware
 * 
 * Enforces organization filtering and security checks across all API routes.
 * Provides comprehensive multi-tenant data isolation and security validation.
 */



/**
 * Creates security context from session
 */
async function createSecurityContext(session: any): Promise<SecurityContext | null> {
  if (!session?.user?.id) {
    return null;
  }

  try {
    // Get user with organization memberships
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        organizationUsers: {
          where: { isActive: true },
          include: {
            organization: true
          }
        }
      }
    });

    if (!user) {
      return null;
    }

    // Get current organization context
    const currentOrg = user.organizationUsers[0]; // Default to first organization
    if (!currentOrg) {
      return null;
    }

    return {
      userId: user.id,
      organizationId: currentOrg.organizationId,
      userEmail: user.email || '',
      isSuperAdmin: user.isSuperAdmin || false,
      userRole: user.role,
      organizationRole: currentOrg.role,
      permissions: Array.isArray(currentOrg.permissions) 
        ? currentOrg.permissions as string[]
        : []
    };
  } catch (error) {
    logger.error('Failed to create security context', error instanceof Error ? error : new Error(String(error)));
    return null;
  }
}

/**
 * Validates user permissions
 */
function validatePermissions(
  securityContext: SecurityContext,
  requiredRoles: string[],
  allowSuperAdmin: boolean = true
): boolean {
  if (allowSuperAdmin && securityContext.isSuperAdmin) {
    return true;
  }

  return requiredRoles.includes(securityContext.organizationRole);
}

/**
 * Main API security middleware
 */
export async function withApiSecurity(
  request: NextRequest,
  handler: (req: NextRequest, context: SecurityContext) => Promise<NextResponse>,
  options: SecurityOptions = {}
) {
  const {
    requireAuth = true,
    requireOrgContext = true,
    requireRole = [],
    allowSuperAdmin = true,
    validateQueries = true,
    logAccess = true
  } = options;

  try {
    // Authentication check
    if (requireAuth) {
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        const error = createAuthenticationError('Authentication required');
        return NextResponse.json(
          { error: error.message },
          { status: 401 }
        );
      }
    }

    // Create security context
    const session = await getServerSession(authOptions);
    const securityContext = await createSecurityContext(session);
    
    if (!securityContext) {
      const error = createAuthenticationError('Invalid security context');
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    // Organization context validation
    if (requireOrgContext) {
      const hasOrgAccess = await validateOrganizationAccess(
        securityContext.userId,
        securityContext.organizationId
      );

      if (!hasOrgAccess && !securityContext.isSuperAdmin) {
        const error = createAuthorizationError('No access to organization');
        return NextResponse.json(
          { error: error.message },
          { status: 403 }
        );
      }
    }

    // Role-based authorization
    if (requireRole.length > 0) {
      const hasPermission = validatePermissions(
        securityContext,
        requireRole,
        allowSuperAdmin
      );

      if (!hasPermission) {
        const error = createAuthorizationError('Insufficient permissions');
        return NextResponse.json(
          { error: error.message },
          { status: 403 }
        );
      }
    }

    // Log access if enabled
    if (logAccess) {
      logDatabaseAccess(
        request.method,
        'api_request',
        securityContext,
        { url: request.url, method: request.method }
      );
    }

    // Call the handler with security context
    return await handler(request, securityContext);

  } catch (error) {
    logger.error('API Security Middleware Error', error instanceof Error ? error : new Error(String(error)));
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Organization-aware query wrapper
 */
export function withSecureQuery<T>(
  query: any,
  securityContext: SecurityContext,
  options: { validate?: boolean; log?: boolean } = {}
): T {
  const { validate = true, log = true } = options;

  // Create secure query
  const secureQuery = createSecureQuery(query, securityContext);

  // Validate query security
  if (validate) {
    const isValid = validateQuerySecurity(secureQuery, securityContext);
    if (!isValid) {
      throw new Error('Query security validation failed');
    }
  }

  // Log query if enabled
  if (log) {
    logDatabaseAccess(
      'query',
      'database_query',
      securityContext,
      secureQuery
    );
  }

  return secureQuery as T;
}

/**
 * Content ownership validator
 */
export async function validateContentAccess(
  contentId: string,
  contentType: 'idea' | 'draft' | 'content',
  securityContext: SecurityContext
): Promise<boolean> {
  const { validateContentOwnership } = await import('@/lib/utils/database-security');
  
  return await validateContentOwnership(
    contentId,
    contentType,
    securityContext
  );
}

/**
 * Organization context validator
 */
export async function validateOrganizationContext(
  organizationId: string,
  securityContext: SecurityContext
): Promise<boolean> {
  // Super admin can access any organization
  if (securityContext.isSuperAdmin) {
    return true;
  }

  // Regular users can only access their own organization
  return securityContext.organizationId === organizationId;
}

/**
 * Rate limiting helper
 */
export function createRateLimiter(maxRequests: number = 100, windowMs: number = 60000) {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return function checkRateLimit(identifier: string): boolean {
    const now = Date.now();
    const userRequests = requests.get(identifier);

    if (!userRequests || now > userRequests.resetTime) {
      requests.set(identifier, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (userRequests.count >= maxRequests) {
      return false;
    }

    userRequests.count++;
    return true;
  };
}

/**
 * Input sanitization helper
 */
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    // Remove potential XSS vectors
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }

  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }

  return input;
}

/**
 * Security headers middleware
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  return response;
}

/**
 * CORS security middleware
 */
export function addCorsHeaders(response: NextResponse, allowedOrigins: string[] = []): NextResponse {
  const origin = allowedOrigins.length > 0 ? allowedOrigins.join(', ') : '*';
  
  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Organization-ID');
  response.headers.set('Access-Control-Max-Age', '86400');
  
  return response;
}

const apiSecurity = {
  withApiSecurity,
  withSecureQuery,
  validateContentAccess,
  validateOrganizationContext,
  createRateLimiter,
  sanitizeInput,
  addSecurityHeaders,
  addCorsHeaders
};

export default apiSecurity; 