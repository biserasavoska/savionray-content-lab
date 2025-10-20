# Organization Context Error Fix Summary

## Date: October 14, 2025

## Errors Encountered in Staging

The following errors were occurring in the staging environment:

```
GET https://savionray-content-lab-production-ffc1.up.railway.app/api/delivery-plans/assignment-options?contentType=BLOG_POST 500 (Internal Server Error)

GET https://savionray-content-lab-production-ffc1.up.railway.app/api/delivery-plans/assignment-options?contentType=SOCIAL_MEDIA_POST 500 (Internal Server Error)

Error: An error occurred in the Server Components render. The specific message is omitted in production builds...
```

## Root Cause Analysis

### Primary Issue: Missing Organization Context Header

The application uses a **multi-tenant architecture** where all data access requires an organization context for security and data isolation. The backend API routes use `requireOrganizationContext()` which:

1. Checks for organization context from either:
   - Cookie: `selectedOrganizationId`
   - HTTP Header: `x-selected-organization`

2. For ADMIN users specifically:
   - If no organization is explicitly selected/provided, the function returns `null`
   - This causes `requireOrganizationContext()` to throw an error
   - The error is caught by the try-catch block and returns a 500 Internal Server Error

### Why This Happened

Several frontend API calls were **not sending the `x-selected-organization` header**, even though:
- The frontend has access to the current organization via the `useOrganization()` hook
- The backend was already configured to read this header
- Other API calls in the codebase were correctly sending the header

This caused API routes requiring organization context to fail with 500 errors, which cascaded into React Server Component render errors.

## Files Fixed

### 1. `/src/app/ideas/new/page.tsx`
**Issue:** Delivery plans assignment options API call missing organization header

**Changes:**
- ✅ Added `import { useOrganization } from '@/lib/contexts/OrganizationContext'`
- ✅ Added `const { currentOrganization } = useOrganization()`
- ✅ Added organization context check before fetching
- ✅ Added `x-selected-organization` header to fetch request
- ✅ Added better error logging

```typescript
// Before
const response = await fetch(`/api/delivery-plans/assignment-options?contentType=${mappedContentType}`)

// After
if (!currentOrganization?.id) {
  console.warn('No organization context available for fetching delivery plans')
  return
}

const response = await fetch(`/api/delivery-plans/assignment-options?contentType=${mappedContentType}`, {
  headers: {
    'x-selected-organization': currentOrganization.id,
  },
})
```

### 2. `/src/components/delivery/DeliveryPlansList.tsx`
**Issue:** Archive endpoint call missing organization header

**Changes:**
- ✅ Added organization context check in `handleArchiveToggle`
- ✅ Added `x-selected-organization` header to archive API call

### 3. `/src/app/content-review/ContentReviewList.tsx`
**Issue:** Content items status update missing organization header

**Changes:**
- ✅ Added organization context check in `handleStatusUpdate`
- ✅ Added `x-selected-organization` header to content items update API call

### 4. `/src/app/ideas/[id]/page.tsx`
**Issue:** Multiple API calls (fetch, update, delete) missing organization header

**Changes:**
- ✅ Added `useOrganization` hook import and usage
- ✅ Updated `fetchIdea()` to include organization header
- ✅ Updated `handleStatusChange()` to include organization header
- ✅ Updated `handleDelete()` to include organization header
- ✅ Updated `useEffect` dependencies to wait for organization context

### 5. `/src/app/ideas/[id]/edit/page.tsx`
**Issue:** Fetch and update API calls missing organization header

**Changes:**
- ✅ Added `useOrganization` hook import and usage
- ✅ Updated `fetchIdea()` to include organization header
- ✅ Updated `handleSubmit()` to include organization header
- ✅ Updated `useEffect` dependencies to wait for organization context

## Backend Configuration (Already Correct)

The backend organization context utility (`/src/lib/utils/organization-context.ts`) was already correctly configured to read the header:

```typescript
// Check for organization in headers (fallback)
if (!selectedOrganizationId) {
  const orgHeader = request.headers.get('x-selected-organization');
  if (orgHeader) {
    selectedOrganizationId = orgHeader;
  }
}
```

## API Routes Requiring Organization Context

The following API routes use `requireOrganizationContext()` and require the header:

### Core Routes (Fixed)
- ✅ `/api/delivery-plans/assignment-options` - Fixed
- ✅ `/api/delivery-plans/[id]/archive` - Fixed
- ✅ `/api/content-items/[id]` - Fixed
- ✅ `/api/ideas/[id]` - Fixed (GET, PATCH, DELETE)

### Other Routes Using Organization Context (37 total)
- `/api/ideas/route.ts`
- `/api/delivery-plans/route.ts`
- `/api/delivery-items/[id]/suggestions/route.ts`
- `/api/ideas/unassigned/route.ts`
- `/api/delivery-items/[id]/assign/route.ts`
- `/api/ready-content/route.ts`
- `/api/content-drafts/route.ts`
- `/api/media/route.ts`
- `/api/organization/*` (multiple routes)
- And 27 more...

## Pattern to Follow

### For ALL API calls to multi-tenant endpoints:

```typescript
// 1. Import the hook
import { useOrganization } from '@/lib/contexts/OrganizationContext'

// 2. Use the hook in your component
const { currentOrganization } = useOrganization()

// 3. Check for organization context before making API calls
if (!currentOrganization?.id) {
  console.error('No organization context available')
  return
}

// 4. Include the header in ALL fetch requests
const response = await fetch('/api/your-endpoint', {
  method: 'GET', // or POST, PUT, PATCH, DELETE
  headers: {
    'Content-Type': 'application/json', // if needed
    'x-selected-organization': currentOrganization.id, // REQUIRED
  },
  body: JSON.stringify(data), // if applicable
})
```

## How to Prevent This in the Future

### 1. Code Review Checklist
When reviewing code that makes API calls, verify:
- [ ] Is the API route using `requireOrganizationContext()`?
- [ ] Is the frontend sending the `x-selected-organization` header?
- [ ] Is there a check for `currentOrganization?.id` before making the call?

### 2. Create a Reusable API Client
Consider creating a wrapper function that automatically includes the organization header:

```typescript
// /src/lib/utils/api-client.ts
import { useOrganization } from '@/lib/contexts/OrganizationContext'

export function useOrgFetch() {
  const { currentOrganization } = useOrganization()
  
  return async (url: string, options: RequestInit = {}) => {
    if (!currentOrganization?.id) {
      throw new Error('No organization context available')
    }
    
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'x-selected-organization': currentOrganization.id,
      },
    })
  }
}

// Usage:
const orgFetch = useOrgFetch()
const response = await orgFetch('/api/ideas')
```

### 3. TypeScript Type Guards
Add type guards to ensure organization context is always checked:

```typescript
function requireOrgContext(org: Organization | null): asserts org is Organization {
  if (!org?.id) {
    throw new Error('Organization context required')
  }
}

// Usage:
requireOrgContext(currentOrganization)
// TypeScript now knows currentOrganization is not null
```

### 4. Linting Rules
Consider adding ESLint rules to catch API calls without organization headers:
- Detect `fetch('/api/` patterns
- Ensure `x-selected-organization` header is present
- Or require use of the wrapper function

## Testing Recommendations

### Before Deployment
1. **Test as an ADMIN user** - This is when the errors are most likely to occur
2. **Test organization switching** - Ensure all API calls update with new org context
3. **Test without organization** - Verify graceful error handling
4. **Check browser console** - Look for 500 errors or organization context warnings

### Regression Testing Checklist
- [ ] Create new idea with delivery plan assignment
- [ ] Archive/unarchive delivery plans
- [ ] Update content item status
- [ ] View, edit, update, delete ideas
- [ ] Switch between organizations and verify data isolation

## Current Status

✅ **All identified issues have been fixed**
✅ **No linter errors introduced**
✅ **Backend was already correctly configured**
✅ **Frontend now properly sends organization context**

## Next Steps

1. **Deploy these fixes** to staging environment
2. **Test thoroughly** with ADMIN user accounts
3. **Monitor for similar errors** in other components
4. **Consider implementing** the API client wrapper for consistency
5. **Review remaining 51 files** with PUT/POST/PATCH/DELETE operations to ensure they also include the header

## Monitoring

After deployment, monitor for:
- Decrease in 500 errors related to organization context
- No new errors in Server Components rendering
- Successful API calls with organization context header in network logs

## Additional Notes

### Why This Particularly Affected ADMIN Users

The organization context logic has special handling for ADMIN users:

```typescript
if (session.user.role === 'ADMIN') {
  logger.warn(`Admin user ${session.user.email} has no organization selected, returning null`);
  return null;
}
```

Non-admin users get an automatic fallback to their first organization, but ADMIN users require explicit organization selection. This is a **security feature** to prevent admins from accidentally accessing/modifying data without being aware of which organization they're working with.

### Multi-Tenant Architecture Benefits

This organization context system provides:
- **Data Isolation**: Each organization's data is completely separate
- **Security**: Users can only access data from organizations they belong to
- **Scalability**: Single codebase serves multiple tenants
- **Audit Trail**: All operations are tied to an organization context

The errors we encountered were actually the security system working as designed - preventing API calls without proper organization context. The fix ensures the frontend properly provides this context.

