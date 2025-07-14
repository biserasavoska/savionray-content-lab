/**
 * Enhanced API Security Middleware
 * 
 * Provides comprehensive security features including:
 * - Organization context validation
 * - Rate limiting and abuse prevention
 * - Input validation and sanitization
 * - Security event logging
 * - Request/response monitoring
 * - CORS and security headers
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';
import { 
  SecurityContext, 
  SecurityOptions, 
  SecurityEvent,
  RateLimitConfig 
} from '@/lib/types/security';
import { createAuthenticationError, createAuthorizationError } from '@/lib/utils/error-handling';

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export interface EnhancedSecurityOptions extends SecurityOptions {
  rateLimit?: RateLimitConfig;
  validateInput?: boolean;
  logSecurityEvents?: boolean;
  requireOrgContext?: boolean;
  allowedMethods?: string[];
  maxRequestSize?: number;
  timeout?: number;
}

export interface SecurityAuditLog {
  timestamp: Date;
  userId: string;
  organizationId: string;
  userEmail: string;
  action: string;
  resource: string;
  method: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

/**
 * Enhanced API Security Wrapper
 */
export function withEnhancedApiSecurity(
  handler: (req: NextRequest, context: SecurityContext) => Promise<NextResponse>,
  options: EnhancedSecurityOptions = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now();
    const requestId = generateRequestId();
    const ipAddress = getClientIP(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';

    try {
      // 1. Basic request validation
      await validateRequest(request, options);

      // 2. Rate limiting
      await checkRateLimit(request, options.rateLimit, ipAddress);

      // 3. Authentication check
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        await logSecurityEvent({
          timestamp: new Date(),
          userId: 'anonymous',
          organizationId: 'none',
          userEmail: 'anonymous',
          action: 'AUTHENTICATION_FAILED',
          resource: request.url,
          method: request.method,
          ipAddress,
          userAgent,
          success: false,
          errorMessage: 'No valid session found'
        });
        throw createAuthenticationError('Authentication required');
      }

      // 4. Organization context validation
      const securityContext = await createSecurityContext(session, request);
      if (options.requireOrgContext && !securityContext.organizationId) {
        await logSecurityEvent({
          timestamp: new Date(),
          userId: session.user.id,
          organizationId: 'none',
          userEmail: session.user.email || '',
          action: 'ORGANIZATION_CONTEXT_MISSING',
          resource: request.url,
          method: request.method,
          ipAddress,
          userAgent,
          success: false,
          errorMessage: 'Organization context required'
        });
        throw createAuthorizationError('Organization context required');
      }

      // 5. Role and permission validation
      if (options.requireRole) {
        await validatePermissions(securityContext, options.requireRole);
      }

      // 6. Input validation
      if (options.validateInput) {
        await validateInput(request, options);
      }

      // 7. Execute handler
      const response = await handler(request, securityContext);

      // 8. Log successful access
      await logSecurityEvent({
        timestamp: new Date(),
        userId: securityContext.userId,
        organizationId: securityContext.organizationId,
        userEmail: securityContext.userEmail,
        action: 'API_ACCESS',
        resource: request.url,
        method: request.method,
        ipAddress,
        userAgent,
        success: true,
        metadata: {
          responseTime: Date.now() - startTime,
          statusCode: response.status,
          requestId
        }
      });

      // 9. Add security headers
      addSecurityHeaders(response);

      return response;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Log security event
      await logSecurityEvent({
        timestamp: new Date(),
        userId: 'unknown',
        organizationId: 'unknown',
        userEmail: 'unknown',
        action: 'API_ERROR',
        resource: request.url,
        method: request.method,
        ipAddress,
        userAgent,
        success: false,
        errorMessage,
        metadata: {
          requestId,
          responseTime: Date.now() - startTime
        }
      });

      // Return appropriate error response
      if (error instanceof Error && 'status' in error) {
        return NextResponse.json(
          { error: errorMessage },
          { status: (error as any).status }
        );
      }

      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Rate Limiting Implementation
 */
async function checkRateLimit(
  request: NextRequest, 
  config: RateLimitConfig | undefined, 
  ipAddress: string
): Promise<void> {
  if (!config) return;

  const key = `rate_limit:${ipAddress}`;
  const now = Date.now();
  const windowMs = config.windowMs || 15 * 60 * 1000; // 15 minutes default
  const maxRequests = config.maxRequests || 100;

  const current = rateLimitStore.get(key);
  
  if (!current || now > current.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return;
  }

  if (current.count >= maxRequests) {
    await logSecurityEvent({
      timestamp: new Date(),
      userId: 'anonymous',
      organizationId: 'none',
      userEmail: 'anonymous',
      action: 'RATE_LIMIT_EXCEEDED',
      resource: request.url,
      method: request.method,
      ipAddress,
      userAgent: request.headers.get('user-agent') || 'unknown',
      success: false,
      errorMessage: `Rate limit exceeded: ${current.count}/${maxRequests} requests`
    });
    
    throw new Error('Rate limit exceeded');
  }

  current.count++;
}

/**
 * Request Validation
 */
async function validateRequest(
  request: NextRequest, 
  options: EnhancedSecurityOptions
): Promise<void> {
  // Method validation
  if (options.allowedMethods && !options.allowedMethods.includes(request.method)) {
    throw new Error(`Method ${request.method} not allowed`);
  }

  // Request size validation
  if (options.maxRequestSize) {
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > options.maxRequestSize) {
      throw new Error('Request too large');
    }
  }

  // Basic CORS validation
  const origin = request.headers.get('origin');
  if (origin && !isValidOrigin(origin)) {
    throw new Error('Invalid origin');
  }
}

/**
 * Input Validation
 */
async function validateInput(
  request: NextRequest, 
  options: EnhancedSecurityOptions
): Promise<void> {
  // Validate JSON payload
  if (request.headers.get('content-type')?.includes('application/json')) {
    try {
      const body = await request.clone().json();
      validateJsonPayload(body);
    } catch (error) {
      throw new Error('Invalid JSON payload');
    }
  }

  // Validate query parameters
  const url = new URL(request.url);
  for (const [key, value] of url.searchParams.entries()) {
    if (!isValidQueryParameter(key, value)) {
      throw new Error(`Invalid query parameter: ${key}`);
    }
  }
}

/**
 * Security Event Logging
 */
async function logSecurityEvent(event: SecurityAuditLog): Promise<void> {
  try {
    // Log to database for audit trail
    await prisma.securityAuditLog.create({
      data: {
        timestamp: event.timestamp,
        userId: event.userId,
        organizationId: event.organizationId,
        userEmail: event.userEmail,
        action: event.action,
        resource: event.resource,
        method: event.method,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        success: event.success,
        errorMessage: event.errorMessage,
        metadata: event.metadata
      }
    });

    // Log to application logger
    logger.info('Security Event', {
      ...event,
      timestamp: event.timestamp.toISOString()
    });

  } catch (error) {
    // Fallback to console if database logging fails
    console.error('Failed to log security event:', error);
    logger.error('Security logging failed', error instanceof Error ? error : undefined);
  }
}

/**
 * Security Headers
 */
function addSecurityHeaders(response: NextResponse): void {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Add CSP header
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
  );
}

/**
 * Utility Functions
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getClientIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
         request.headers.get('x-real-ip') ||
         'unknown';
}

function isValidOrigin(origin: string): boolean {
  // Add your allowed origins here
  const allowedOrigins = [
    'http://localhost:3000',
    'https://yourdomain.com'
  ];
  return allowedOrigins.includes(origin);
}

function isValidQueryParameter(key: string, value: string): boolean {
  // Basic validation - extend as needed
  if (key.length > 50 || value.length > 1000) return false;
  if (/[<>\"']/.test(value)) return false; // Basic XSS prevention
  return true;
}

function validateJsonPayload(payload: any): void {
  // Basic JSON validation - extend as needed
  if (typeof payload === 'object' && payload !== null) {
    const jsonString = JSON.stringify(payload);
    if (jsonString.length > 1000000) { // 1MB limit
      throw new Error('Payload too large');
    }
  }
}

/**
 * Create Security Context with Enhanced Validation
 */
async function createSecurityContext(session: any, request: NextRequest): Promise<SecurityContext> {
  const user = session.user;
  
  // Get current organization from request or session
  const organizationId = request.headers.get('x-organization-id') || 
                        request.cookies.get('selectedOrganizationId')?.value;

  if (!organizationId) {
    throw new Error('Organization context required');
  }

  // Validate organization membership
  const organizationUser = await prisma.organizationUser.findFirst({
    where: {
      userId: user.id,
      organizationId,
      isActive: true
    },
    include: {
      organization: true
    }
  });

  if (!organizationUser) {
    throw new Error('User not member of organization');
  }

  return {
    userId: user.id,
    organizationId,
    userEmail: user.email || '',
    isSuperAdmin: user.isSuperAdmin || false,
    userRole: user.role,
    organizationRole: organizationUser.role,
    permissions: Array.isArray(organizationUser.permissions) 
      ? organizationUser.permissions as string[]
      : []
  };
}

/**
 * Validate Permissions
 */
async function validatePermissions(
  context: SecurityContext, 
  requiredRoles: string[]
): Promise<void> {
  const hasRole = requiredRoles.includes(context.organizationRole) ||
                  (context.isSuperAdmin && requiredRoles.includes('ADMIN'));
  
  if (!hasRole) {
    throw createAuthorizationError(`Insufficient permissions. Required: ${requiredRoles.join(', ')}`);
  }
}

export default {
  withEnhancedApiSecurity,
  logSecurityEvent,
  addSecurityHeaders
}; 