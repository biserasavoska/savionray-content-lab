import { NextRequest, NextResponse } from 'next/server';
import { rollbar } from '@/lib/rollbar';

export function withRollbarErrorHandling(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      return await handler(req);
    } catch (error) {
      // Report error to Rollbar
      rollbar.error(error as Error, {
        request: {
          method: req.method,
          url: req.url,
          headers: Object.fromEntries(req.headers.entries()),
        },
        source: 'api-middleware',
      });

      // Return a generic error response
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

// Utility function to report API errors with context
export function reportApiError(
  error: Error,
  context: {
    endpoint?: string;
    method?: string;
    userId?: string;
    organizationId?: string;
    additionalData?: any;
  } = {}
) {
  rollbar.error(error, {
    ...context,
    source: 'api-endpoint',
    timestamp: new Date().toISOString(),
  });
}

// Utility function to report API warnings
export function reportApiWarning(
  message: string,
  context: {
    endpoint?: string;
    method?: string;
    userId?: string;
    organizationId?: string;
    additionalData?: any;
  } = {}
) {
  rollbar.warning(message, {
    ...context,
    source: 'api-endpoint',
    timestamp: new Date().toISOString(),
  });
}

// Utility function to report API info
export function reportApiInfo(
  message: string,
  context: {
    endpoint?: string;
    method?: string;
    userId?: string;
    organizationId?: string;
    additionalData?: any;
  } = {}
) {
  rollbar.info(message, {
    ...context,
    source: 'api-endpoint',
    timestamp: new Date().toISOString(),
  });
}
