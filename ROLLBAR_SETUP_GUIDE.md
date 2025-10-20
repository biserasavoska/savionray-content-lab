# Rollbar Error Monitoring Setup Guide

## Overview

Rollbar has been successfully integrated into your SavionRay Content Lab project for comprehensive error monitoring and tracking. This setup includes both client-side and server-side error reporting capabilities.

## What is Rollbar?

Rollbar is a real-time error tracking platform that helps you monitor and debug errors in your applications. It automatically captures errors, exceptions, and performance issues across your codebase and provides detailed insights to help you fix issues quickly.

## Files Added/Modified

### New Files:
- `src/lib/rollbar.ts` - Main Rollbar configuration and utility functions
- `src/components/RollbarProvider.tsx` - Client-side Rollbar provider component
- `src/lib/middleware/rollbar-middleware.ts` - Server-side API error handling middleware
- `src/app/api/test-rollbar/route.ts` - Test API endpoint for server-side testing
- `src/app/test-rollbar/page.tsx` - Test page for verifying Rollbar integration
- `rollbar-env-setup.md` - Environment variables setup instructions

### Modified Files:
- `src/components/RootClientWrapper.tsx` - Added RollbarProvider integration
- `package.json` - Added rollbar dependency

## Environment Variables Setup

Create a `.env.local` file in your project root with the following variables:

```bash
# Rollbar Configuration
# Server Access Token (keep this secure - server-side only)
ROLLBAR_SERVER_ACCESS_TOKEN=04c4928a2f754ab0bdc091733c7a8e26

# Client Access Token (public - safe for client-side)
NEXT_PUBLIC_ROLLBAR_CLIENT_ACCESS_TOKEN=5edea99b9891476885963e63bbbe691c

# App Version (optional - for tracking deployments)
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## Features Implemented

### 1. Client-Side Error Monitoring
- Automatic uncaught error capture
- Manual error reporting functions
- Info and warning message reporting
- Integration with React error boundaries

### 2. Server-Side Error Monitoring
- API endpoint error handling middleware
- Automatic server error capture
- Contextual error reporting with request details
- Manual error reporting utilities

### 3. Testing Infrastructure
- Comprehensive test page at `/test-rollbar`
- Client-side and server-side test functions
- API endpoint testing capabilities

## Usage

### Client-Side Usage

```typescript
import { reportError, reportInfo, reportWarning } from '@/lib/rollbar';

// Report an error
try {
  // Some risky operation
} catch (error) {
  reportError(error, { context: 'user-action' });
}

// Report info/warnings
reportInfo('User performed action', { userId: '123' });
reportWarning('Deprecated API usage detected', { endpoint: '/api/old' });
```

### Server-Side Usage

```typescript
import { reportApiError, reportApiWarning, reportApiInfo } from '@/lib/middleware/rollbar-middleware';

// In API routes
export async function GET(request: NextRequest) {
  try {
    // Your API logic
  } catch (error) {
    reportApiError(error, {
      endpoint: '/api/your-endpoint',
      method: 'GET',
      userId: session?.user?.id
    });
    throw error;
  }
}
```

## Testing the Integration

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Visit the test page:**
   Navigate to `http://localhost:3000/test-rollbar`

3. **Run the tests:**
   - Click the various test buttons to trigger different types of errors
   - Check your Rollbar dashboard for incoming error reports
   - Verify both client-side and server-side errors are being captured

## Rollbar Dashboard

Access your Rollbar dashboard at: https://rollbar.com

Your project is named: **SavionRayContentLab**

## Security Considerations

- Server access token is kept secure and only used server-side
- Client access token is safe to expose in browser environments
- Environment variables are properly configured for different environments
- Error reporting includes contextual information without exposing sensitive data

## Next Steps

1. **Set up environment variables** as described above
2. **Test the integration** using the test page
3. **Monitor your Rollbar dashboard** for incoming error reports
4. **Configure notifications** in Rollbar for critical errors
5. **Set up deployment tracking** to correlate errors with code versions

## Troubleshooting

### Common Issues:

1. **Errors not appearing in Rollbar:**
   - Check that environment variables are set correctly
   - Verify network connectivity
   - Check browser console for Rollbar initialization errors

2. **Client-side errors not captured:**
   - Ensure RollbarProvider is properly wrapped around your app
   - Check that the Rollbar script is loading correctly

3. **Server-side errors not captured:**
   - Verify server access token is set correctly
   - Check that the rollbar middleware is being used in API routes

### Debug Mode:
Enable debug logging by adding this to your environment variables:
```bash
ROLLBAR_DEBUG=true
```

## Support

For Rollbar-specific issues, refer to:
- [Rollbar Documentation](https://docs.rollbar.com/docs/getting-started)
- [Rollbar JavaScript SDK](https://docs.rollbar.com/docs/javascript)

For project-specific issues, check the test page at `/test-rollbar` for debugging information.
