# Staging Deployment Guide - Organization Context Fixes

## 🎯 Goal
Deploy and test the organization context fixes in staging before promoting to production.

## 📋 Pre-Deployment Checklist

### ✅ Code Changes Ready
- [x] Fixed organization context headers in API calls
- [x] Replaced `window.location.reload()` with targeted data refresh
- [x] All files linter-clean
- [x] No TypeScript errors

### ✅ Files Modified
1. `src/app/ideas/new/page.tsx` - Delivery plans assignment options
2. `src/components/delivery/DeliveryPlansList.tsx` - Archive functionality + UX improvement
3. `src/app/content-review/ContentReviewList.tsx` - Content status updates + UX improvement
4. `src/app/ideas/[id]/page.tsx` - Idea CRUD operations
5. `src/app/ideas/[id]/edit/page.tsx` - Idea edit operations

## 🚀 Deployment Steps

### Step 1: Commit Changes
```bash
# Add all modified files
git add src/app/ideas/new/page.tsx
git add src/components/delivery/DeliveryPlansList.tsx
git add src/app/content-review/ContentReviewList.tsx
git add src/app/ideas/[id]/page.tsx
git add src/app/ideas/[id]/edit/page.tsx

# Commit with descriptive message
git commit -m "Fix: Organization context headers + UX improvements

- Fix 500 errors in delivery plans assignment options
- Fix archive endpoint missing organization header  
- Fix content items status update missing header
- Fix idea CRUD operations missing organization context
- Replace window.location.reload() with targeted data refresh
- Preserve organization context after user actions
- All API calls now properly send x-selected-organization header

Resolves staging environment 500 errors for ADMIN users.
Improves UX by maintaining organization context after actions."
```

### Step 2: Push to Staging
```bash
# Push to staging branch (adjust branch name as needed)
git push origin develop
```

### Step 3: Monitor Deployment
- Check your deployment platform (Railway/Vercel/etc.) for staging deployment status
- Wait for deployment to complete
- Verify staging URL is updated with latest changes

## 🧪 Staging Testing Plan

### Critical Test: ADMIN User Scenarios
**Why:** The original errors were specifically affecting ADMIN users due to organization context requirements.

### Test Environment Setup
1. **Clear browser cache** or use incognito mode
2. **Log in as ADMIN user** (not regular user)
3. **Select an organization** if prompted
4. **Open browser DevTools** (Console + Network tabs)

### Test Scenarios

#### 🎯 Test 1: Create New Idea (Original Error Source)
**URL:** `/ideas/new`

**Steps:**
1. Go to "Create New Idea" page
2. Select any content type (blog, social-media, etc.)
3. **Expected:** Delivery plans should load without 500 errors
4. **Check Console:** Should see "Fetching delivery plans for organization: [org-id]"
5. **Check Network:** Should see successful GET request to `/api/delivery-plans/assignment-options`

**Success Criteria:**
- ✅ No 500 Internal Server Error
- ✅ Delivery plans dropdown populates
- ✅ No "Organization context required" errors

#### 🎯 Test 2: Archive Delivery Plan (Original Error Source)
**URL:** `/delivery-plans`

**Steps:**
1. Go to Delivery Plans page
2. Find a plan in DRAFT status
3. Click "Archive" button
4. **Expected:** Plan should archive successfully
5. **Check Console:** Should see no errors
6. **Check Network:** Should see successful PATCH request
7. **Check UX:** Should NOT reload entire page
8. **Check Organization:** Should stay in same organization

**Success Criteria:**
- ✅ No 500 Internal Server Error
- ✅ Plan status updates to archived
- ✅ No full page reload
- ✅ Stay in same organization context
- ✅ List updates smoothly

#### 🎯 Test 3: Update Content Status
**URL:** `/content-review`

**Steps:**
1. Go to Content Review page
2. Find a content item with status dropdown
3. Change the status (e.g., DRAFT → APPROVED)
4. **Expected:** Status should update successfully
5. **Check Console:** Should see no errors
6. **Check Network:** Should see successful PUT request
7. **Check UX:** Should NOT reload entire page
8. **Check Organization:** Should stay in same organization

**Success Criteria:**
- ✅ No 500 Internal Server Error
- ✅ Status updates correctly
- ✅ No full page reload
- ✅ Stay in same organization context
- ✅ List updates smoothly

#### 🎯 Test 4: Edit Ideas
**URL:** `/ideas/[id]` and `/ideas/[id]/edit`

**Steps:**
1. Go to any idea detail page
2. Try to approve/reject the idea
3. Go to edit page and make changes
4. **Expected:** All operations should work
5. **Check Console:** Should see no organization context errors
6. **Check Network:** Should see successful API calls with organization headers

**Success Criteria:**
- ✅ No 500 Internal Server Error
- ✅ Idea operations work correctly
- ✅ Organization context preserved
- ✅ API calls include organization headers

### 🔍 What to Look For

#### ✅ Success Indicators
- No 500 Internal Server Errors in console
- Successful API calls in Network tab
- Organization context preserved after actions
- Smooth UI updates without page reloads
- Proper organization headers in API requests

#### ❌ Failure Indicators
- 500 Internal Server Errors
- "Organization context required" errors
- Organization context switching unexpectedly
- Full page reloads when they shouldn't happen
- Missing organization headers in API requests

## 📊 Monitoring

### Browser Console Monitoring
Watch for these log messages:
- ✅ `"Fetching delivery plans for organization: [org-id]"`
- ✅ `"Received delivery plans data: {plans: Array(X)}"`
- ❌ `"Organization context required but not available"`
- ❌ `"500 (Internal Server Error)"`

### Network Tab Monitoring
Verify these headers are present:
```
x-selected-organization: [organization-id]
```

### Performance Monitoring
- Page load times should not increase
- API response times should be normal
- No unexpected network requests

## 🚨 Rollback Plan

If issues are found in staging:

### Quick Rollback
```bash
# Revert to previous commit
git revert HEAD
git push origin develop
```

### Alternative: Hotfix
If only minor issues:
1. Fix the specific problem
2. Commit and push fix
3. Test again in staging

## ✅ Staging Success Criteria

**All tests must pass before promoting to production:**

- [ ] No 500 errors in any test scenario
- [ ] Organization context preserved in all operations
- [ ] Smooth UX without unnecessary page reloads
- [ ] All API calls include proper organization headers
- [ ] Performance is not degraded
- [ ] No new errors introduced

## 🎉 Ready for Production?

**Only promote to production when:**
- ✅ All staging tests pass
- ✅ No critical issues found
- ✅ Performance is acceptable
- ✅ User experience is improved

## 📞 Support

If issues are found during staging testing:
1. **Document the exact steps** that caused the issue
2. **Screenshot any error messages**
3. **Check browser console** for error details
4. **Check network tab** for failed requests
5. **Report with reproduction steps**

## 🎯 Expected Outcome

After successful staging deployment and testing:
- ✅ Original 500 errors resolved
- ✅ Organization context preserved after all actions
- ✅ Improved user experience with smoother updates
- ✅ Ready for production deployment
