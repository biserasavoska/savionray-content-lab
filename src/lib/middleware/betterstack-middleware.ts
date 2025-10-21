/**
 * Better Stack middleware for Next.js API routes
 * Automatically tracks API requests and responses
 */

import { NextRequest, NextResponse } from 'next/server';
import betterStack from '../betterstack';

export function withBetterStackTracking(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now();
    const method = request.method;
    const endpoint = request.nextUrl.pathname;
    
    try {
      // Get user information from request if available
      const userId = request.headers.get('x-user-id') || undefined;
      const organizationId = request.headers.get('x-organization-id') || undefined;

      // Log the incoming request
      await betterStack.logInfo(`API Request: ${method} ${endpoint}`, {
        method,
        endpoint,
        userId,
        organizationId,
        userAgent: request.headers.get('user-agent'),
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      });

      // Execute the actual handler
      const response = await handler(request);

      // Calculate duration
      const duration = Date.now() - startTime;
      const statusCode = response.status;

      // Track the API request
      await betterStack.trackApiRequest(
        method,
        endpoint,
        statusCode,
        duration,
        userId,
        organizationId
      );

      // Log response
      await betterStack.logInfo(`API Response: ${method} ${endpoint}`, {
        method,
        endpoint,
        statusCode,
        duration,
        userId,
        organizationId,
      });

      return response;
    } catch (error) {
      // Calculate duration even for errors
      const duration = Date.now() - startTime;
      
      // Log the error
      await betterStack.logError(
        `API Error: ${method} ${endpoint}`,
        error as Error,
        {
          method,
          endpoint,
          duration,
          userId,
          organizationId,
        }
      );

      // Re-throw the error
      throw error;
    }
  };
}

export function reportApiError(error: Error, context: Record<string, any> = {}) {
  return betterStack.logError('API Error', error, { ...context, source: 'api-route' });
}

export function reportApiWarning(message: string, context: Record<string, any> = {}) {
  return betterStack.logWarning(message, { ...context, source: 'api-route' });
}

export function reportApiInfo(message: string, context: Record<string, any> = {}) {
  return betterStack.logInfo(message, { ...context, source: 'api-route' });
}

export function trackApiMetric(name: string, value: number, tags: Record<string, string> = {}) {
  return betterStack.trackMetric(name, value, { ...tags, source: 'api-route' });
}

