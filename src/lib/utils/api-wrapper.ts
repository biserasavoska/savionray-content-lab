import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { errorHandler, withErrorHandling, AuthenticationError, AuthorizationError } from '@/lib/middleware/error-handler';
import { logger } from '@/lib/utils/logger';
import { withLogging } from '@/lib/middleware/logger';

export interface ApiHandlerOptions {
  requireAuth?: boolean;
  requireRole?: string[];
  requireOrganization?: boolean;
  validateBody?: (body: any) => boolean | string;
  rateLimit?: {
    windowMs: number;
    maxRequests: number;
  };
}

export interface ApiContext {
  session: any;
  user: any;
  organization: any;
  request: NextRequest;
}

export function createApiHandler(
  handler: (req: NextRequest, context: ApiContext) => Promise<NextResponse>,
  options: ApiHandlerOptions = {}
) {
  return withLogging(async (req: NextRequest) => {
    try {
      // Get session
      const session = await getServerSession(authOptions);
      
      // Check authentication if required
      if (options.requireAuth && !session) {
        throw new AuthenticationError();
      }

      // Get user context
      let user = null;
      let organization = null;

      if (session?.user) {
        // Import organization context utility
        const { getOrganizationContext } = await import('@/lib/utils/organization-context');
        
        const orgContext = await getOrganizationContext(undefined, req);
        if (orgContext) {
          user = {
            id: orgContext.userId,
            email: orgContext.userEmail,
            role: orgContext.userRole,
            isSuperAdmin: orgContext.isSuperAdmin
          };
          organization = {
            id: orgContext.organizationId,
            role: orgContext.organizationRole,
            permissions: orgContext.permissions
          };
        }
      }

      // Check role requirements
      if (options.requireRole && user) {
        const hasRequiredRole = options.requireRole.some(role => 
          user.role === role || 
          (organization && organization.role === role)
        );
        
        if (!hasRequiredRole) {
          throw new AuthorizationError(`Required role: ${options.requireRole.join(' or ')}`);
        }
      }

      // Check organization requirement
      if (options.requireOrganization && !organization) {
        throw new AuthenticationError('Organization context required');
      }

      // Validate request body if validator provided
      if (options.validateBody && req.method !== 'GET' && req.method !== 'HEAD') {
        try {
          const body = await req.json();
          const validationResult = options.validateBody(body);
          
          if (validationResult !== true) {
            throw new Error(typeof validationResult === 'string' ? validationResult : 'Invalid request body');
          }
        } catch (error) {
          if (error instanceof Error) {
            throw new Error(`Body validation failed: ${error.message}`);
          }
          throw new Error('Invalid request body');
        }
      }

      // Create context
      const context: ApiContext = {
        session,
        user,
        organization,
        request: req
      };

      // Execute handler
      const response = await handler(req, context);

      // Add security headers
      if (response instanceof NextResponse) {
        response.headers.set('X-Content-Type-Options', 'nosniff');
        response.headers.set('X-Frame-Options', 'DENY');
        response.headers.set('X-XSS-Protection', '1; mode=block');
        response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
        
        if (process.env.NODE_ENV === 'production') {
          response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }
      }

      return response;

    } catch (error) {
      return errorHandler(error, req);
    }
  });
}

// Convenience functions for common API patterns
export function createGetHandler(
  handler: (req: NextRequest, context: ApiContext) => Promise<NextResponse>,
  options: ApiHandlerOptions = {}
) {
  return createApiHandler(async (req, context) => {
    if (req.method !== 'GET') {
      return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
    }
    return handler(req, context);
  }, options);
}

export function createPostHandler(
  handler: (req: NextRequest, context: ApiContext) => Promise<NextResponse>,
  options: ApiHandlerOptions = {}
) {
  return createApiHandler(async (req, context) => {
    if (req.method !== 'POST') {
      return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
    }
    return handler(req, context);
  }, options);
}

export function createPutHandler(
  handler: (req: NextRequest, context: ApiContext) => Promise<NextResponse>,
  options: ApiHandlerOptions = {}
) {
  return createApiHandler(async (req, context) => {
    if (req.method !== 'PUT') {
      return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
    }
    return handler(req, context);
  }, options);
}

export function createDeleteHandler(
  handler: (req: NextRequest, context: ApiContext) => Promise<NextResponse>,
  options: ApiHandlerOptions = {}
) {
  return createApiHandler(async (req, context) => {
    if (req.method !== 'DELETE') {
      return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
    }
    return handler(req, context);
  }, options);
}

// Utility for creating CRUD handlers
export function createCrudHandler(
  handlers: {
    GET?: (req: NextRequest, context: ApiContext) => Promise<NextResponse>;
    POST?: (req: NextRequest, context: ApiContext) => Promise<NextResponse>;
    PUT?: (req: NextRequest, context: ApiContext) => Promise<NextResponse>;
    DELETE?: (req: NextRequest, context: ApiContext) => Promise<NextResponse>;
  },
  options: ApiHandlerOptions = {}
) {
  return createApiHandler(async (req, context) => {
    const handler = handlers[req.method as keyof typeof handlers];
    
    if (!handler) {
      return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
    }
    
    return handler(req, context);
  }, options);
}

// Response helpers
export function successResponse(data: any, status: number = 200): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    timestamp: new Date().toISOString()
  }, { status });
}

export function errorResponse(message: string, status: number = 400, code?: string): NextResponse {
  return NextResponse.json({
    success: false,
    error: {
      message,
      code: code || 'VALIDATION_ERROR'
    },
    timestamp: new Date().toISOString()
  }, { status });
}

export function paginatedResponse(
  data: any[],
  page: number,
  limit: number,
  total: number,
  status: number = 200
): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    },
    timestamp: new Date().toISOString()
  }, { status });
} 