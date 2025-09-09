# LogRocket Integration Guide

## Overview
LogRocket has been successfully integrated into the Savion Ray Content Lab application to provide session replay, error tracking, and user analytics.

## What's Been Implemented

### 1. Package Installation
- LogRocket package installed via npm: `npm install --save logrocket`

### 2. Components Created
- **LogRocketProvider** (`src/components/LogRocketProvider.tsx`): Client-side component that initializes LogRocket and identifies users
- **LogRocket utilities** (`src/lib/logrocket.ts`): Helper functions for logging events and errors

### 3. Integration Points
- Integrated into `RootClientWrapper` to ensure LogRocket initializes on every page
- User identification happens automatically when users log in
- Works with both authenticated and unauthenticated users

### 4. Environment Configuration
- App ID: `m4ch7c/savion-ray-content-lab`
- Environment variable: `NEXT_PUBLIC_LOGROCKET_APP_ID`
- Added to `env.production.example` for Railway deployment

## Features Enabled

### Session Replay
- Records user interactions, clicks, and navigation
- Captures console logs and network requests
- Provides full session playback for debugging

### User Identification
- Automatically identifies users when they log in
- Tracks user role, email, name, and organization
- Enables filtering sessions by user attributes

### Error Tracking
- Captures JavaScript errors and exceptions
- Provides stack traces and context
- Integrates with session replay for better debugging

### Performance Monitoring
- Tracks page load times
- Monitors API response times
- Identifies performance bottlenecks

## Usage

### Basic Usage
LogRocket is automatically initialized and doesn't require any additional setup. It will start recording sessions immediately.

### Custom Event Tracking
```typescript
import { logEvent, logError } from '@/lib/logrocket'

// Track custom events
logEvent('content_created', { contentType: 'blog_post', organizationId: '123' })

// Log errors
logError(new Error('Something went wrong'), { context: 'content_creation' })
```

### User Identification
User identification happens automatically, but you can manually identify users if needed:
```typescript
import { identifyUser } from '@/lib/logrocket'

identifyUser({
  email: 'user@example.com',
  name: 'John Doe',
  role: 'CLIENT',
  organizationId: 'org_123'
})
```

## Environment Variables

### Development
Create a `.env.local` file with:
```
NEXT_PUBLIC_LOGROCKET_APP_ID="m4ch7c/savion-ray-content-lab"
```

### Production (Railway)
Add the environment variable in Railway dashboard:
```
NEXT_PUBLIC_LOGROCKET_APP_ID=m4ch7c/savion-ray-content-lab
```

## Verification

### Local Testing
1. Start the development server: `npm run dev`
2. Open browser console and look for: "LogRocket initialized with app ID: m4ch7c/savion-ray-content-lab"
3. Navigate through the app and perform actions
4. Check LogRocket dashboard for recorded sessions

### Production Testing
1. Deploy to Railway with the environment variable set
2. Visit the production site
3. Perform various actions (login, create content, etc.)
4. Check LogRocket dashboard for production sessions

## LogRocket Dashboard
- Access your LogRocket dashboard at: https://app.logrocket.com
- View sessions, errors, and analytics
- Filter by user, date, or custom attributes
- Set up alerts for errors or performance issues

## Privacy Considerations
- LogRocket respects user privacy and doesn't record sensitive form inputs by default
- User identification only includes non-sensitive information (email, role, organization)
- Consider adding privacy controls if needed for sensitive applications

## Troubleshooting

### LogRocket Not Initializing
- Check browser console for errors
- Verify environment variable is set correctly
- Ensure the app ID is correct in LogRocket dashboard

### No Sessions Appearing
- Wait a few minutes for data to appear in dashboard
- Check that the app ID matches exactly
- Verify the site is being accessed (not just localhost in some cases)

### Performance Issues
- LogRocket is designed to be lightweight and shouldn't impact performance
- If you notice issues, check the LogRocket configuration
- Consider adjusting sampling rates if needed

## Next Steps
1. Test the integration locally
2. Deploy to Railway and verify production functionality
3. Set up alerts and monitoring in LogRocket dashboard
4. Train team on using LogRocket for debugging and user research
