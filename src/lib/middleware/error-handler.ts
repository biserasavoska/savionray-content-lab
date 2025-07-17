import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  isOperational?: boolean;
}

export class OperationalError extends Error implements AppError {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends OperationalError {
  constructor(message: string, field?: string) {
    super(message, 400, 'VALIDATION_ERROR');
    this.field = field;
  }
  
  public field?: string;
}

export class AuthenticationError extends OperationalError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends OperationalError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends OperationalError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND_ERROR');
  }
}

export function handleError(error: unknown): AppError {
  // If it's already an AppError, return it
  if (error instanceof OperationalError) {
    return error;
  }

  // If it's a Prisma error, convert it
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as any;
    
    switch (prismaError.code) {
      case 'P2002':
        return new ValidationError('A record with this unique field already exists');
      case 'P2025':
        return new NotFoundError('Record');
      case 'P2003':
        return new ValidationError('Foreign key constraint failed');
      default:
        return new OperationalError(prismaError.message || 'Database error', 500, 'DATABASE_ERROR');
    }
  }

  // If it's a standard Error, wrap it
  if (error instanceof Error) {
    return new OperationalError(error.message, 500, 'INTERNAL_ERROR');
  }

  // If it's something else, create a generic error
  return new OperationalError(
    typeof error === 'string' ? error : 'An unexpected error occurred',
    500,
    'UNKNOWN_ERROR'
  );
}

export function errorHandler(
  error: unknown,
  request: NextRequest
): NextResponse {
  const appError = handleError(error);
  
  // Log the error with context
  logger.error('Request failed', appError, {
    errorCode: appError.code,
    statusCode: appError.statusCode,
    request: {
      method: request.method,
      url: request.url,
      headers: Object.fromEntries(request.headers.entries())
    }
  });

  // Don't expose internal errors to the client
  const clientMessage = appError.isOperational 
    ? appError.message 
    : 'An unexpected error occurred';

  return NextResponse.json(
    {
      success: false,
      error: {
        message: clientMessage,
        code: appError.code,
        ...(process.env.NODE_ENV === 'development' && {
          stack: appError.stack,
          details: appError.message
        })
      },
      requestId: request.headers.get('x-request-id') || 'unknown'
    },
    { status: appError.statusCode }
  );
}

export function withErrorHandling<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await handler(...args);
    } catch (error) {
      throw handleError(error);
    }
  };
} 