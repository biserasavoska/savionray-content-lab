# Deployment Checklist for Organization Context Fixes

## Files Changed (Ready for Deployment)

✅ **All fixes are complete and linter-clean**

### Modified Files:
1. `src/app/ideas/new/page.tsx` - Fixed delivery plans assignment options
2. `src/components/delivery/DeliveryPlansList.tsx` - Fixed archive endpoint
3. `src/app/content-review/ContentReviewList.tsx` - Fixed content items update
4. `src/app/ideas/[id]/page.tsx` - Fixed idea CRUD operations
5. `src/app/ideas/[id]/edit/page.tsx` - Fixed idea edit operations

## Pre-Deployment Steps

### 1. Verify Changes
```bash
# Check git status
git status

# Review the changes
git diff

# Run linter to ensure no errors
npm run lint
```

### 2. Test Locally (Optional)
```bash
# Start development server
npm run dev

# Test the following scenarios:
# - Create new idea with delivery plan assignment
# - Archive/unarchive delivery plans
# - Update content item status
# - Edit/update/delete ideas
```

## Deployment Steps

### 1. Commit and Push Changes
```bash
# Add all modified files
git add src/app/ideas/new/page.tsx
git add src/components/delivery/DeliveryPlansList.tsx
git add src/app/content-review/ContentReviewList.tsx
git add src/app/ideas/[id]/page.tsx
git add src/app/ideas/[id]/edit/page.tsx

# Commit with descriptive message
git commit -m "Fix: Add organization context headers to API calls + improve UX

- Fix 500 errors in delivery plans assignment options
- Fix archive endpoint missing organization header
- Fix content items status update missing header
- Fix idea CRUD operations missing organization context
- Replace window.location.reload() with targeted data refresh
- Preserve organization context after user actions
- All API calls now properly send x-selected-organization header

Resolves staging environment 500 errors for ADMIN users.
Improves UX by maintaining organization context after actions."

# Push to staging branch first
git push origin develop  # or your staging branch
```

### 2. Deploy to Staging First
Depending on your deployment setup:

**If using Railway:**
- Deploy to staging environment first (usually `develop` branch)
- Check Railway dashboard for staging deployment status
- Verify staging URL is updated with latest changes

**If using Vercel:**
- Deploy to preview/staging environment first
- Check deployment logs for any issues
- Test on staging URL before promoting to production

**If using other platform:**
- Follow your standard staging → production deployment process

### 3. Test in Staging Environment

**Critical Testing in Staging:**
- [ ] **Test as ADMIN user** - This is when the errors are most likely to occur
- [ ] **Test organization switching** - Ensure all API calls update with new org context
- [ ] **Test archive functionality** - Verify organization context is preserved
- [ ] **Test content status updates** - Verify no page reloads and context preserved
- [ ] **Check browser console** - Look for 500 errors or organization context warnings
- [ ] **Test on different browsers** - Chrome, Firefox, Safari
- [ ] **Test with slow network** - Ensure timing doesn't cause issues

**Staging Test Scenarios:**
1. **Create New Idea**: Go to `/ideas/new` and select a content type
   - Should successfully load delivery plans without 500 errors
   - Check browser console for "Fetching delivery plans for organization" logs

2. **Archive Delivery Plan**: Go to delivery plans and click "Archive" button
   - Should successfully archive without 500 errors
   - Should stay in the same organization (no context switching)
   - Should not reload the entire page
   - Check network tab for successful PATCH request

3. **Update Content Status**: Go to content review and update item status
   - Should successfully update without 500 errors
   - Should stay in the same organization
   - Should not reload the entire page

4. **Edit Ideas**: Go to any idea detail page and edit/update/delete
   - Should work without organization context errors
   - Should stay in the same organization

### 4. Deploy to Production (After Staging Success)

**Only after successful staging testing:**
- Deploy to production environment
- Monitor for any issues
- Have rollback plan ready

## Post-Deployment Testing

### 1. Clear Browser Cache
- Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
- Or open in incognito/private mode

### 2. Test as ADMIN User
The errors were specifically affecting ADMIN users, so test with an admin account:

**Test Scenarios:**
- [ ] **Create New Idea**: Go to `/ideas/new` and select a content type
  - Should successfully load delivery plans without 500 errors
  - Check browser console for "Fetching delivery plans for organization" logs

- [ ] **Archive Delivery Plan**: Go to delivery plans and click "Archive" button
  - Should successfully archive without 500 errors
  - Check network tab for successful PATCH request

- [ ] **Update Content Status**: Go to content review and update item status
  - Should successfully update without 500 errors

- [ ] **Edit Ideas**: Go to any idea detail page and edit/update/delete
  - Should work without organization context errors

### 3. Monitor Console Logs
Open browser DevTools and watch for:
- ✅ **Success**: "Fetching delivery plans for organization: [org-id]"
- ✅ **Success**: Successful API calls with 200 status codes
- ❌ **Error**: No more 500 Internal Server Errors
- ❌ **Error**: No more "Organization context required" errors

### 4. Check Network Tab
In DevTools Network tab, verify that API requests include:
```
Headers:
  x-selected-organization: [organization-id]
```

## Troubleshooting

### If Errors Persist After Deployment:

1. **Check Deployment Status**
   - Verify the latest commit is deployed
   - Check deployment logs for any build errors

2. **Verify Browser Cache**
   - Try incognito/private mode
   - Clear all browser data for the site
   - Hard refresh multiple times

3. **Check Organization Context**
   - Verify you're logged in as an admin user
   - Check if organization selector is working
   - Look for organization context warnings in console

4. **Debug Network Requests**
   - Check if `x-selected-organization` header is being sent
   - Verify the organization ID is valid
   - Check API response for specific error messages

### If New Errors Appear:

1. **Check Server Logs**
   - Look for any new error patterns
   - Verify database connectivity
   - Check for any environment variable issues

2. **Rollback Plan**
   - If critical issues, you can rollback the deployment
   - Keep the old commit hash for quick rollback if needed

## Expected Results

After successful deployment:
- ✅ No more 500 Internal Server Errors
- ✅ Delivery plans assignment options load properly
- ✅ Archive/unarchive functionality works
- ✅ Content status updates work
- ✅ Idea CRUD operations work
- ✅ All API calls include proper organization context

## Monitoring

Monitor the production environment for:
- Decreased error rates in logs
- Successful API calls in network monitoring
- No user complaints about functionality issues
- Improved application stability

## Next Steps

After successful deployment:
1. **Document the fix** in your team knowledge base
2. **Review other API calls** (51 files with PUT/POST/PATCH/DELETE operations)
3. **Consider implementing** the reusable API client wrapper
4. **Add linting rules** to prevent similar issues in the future
