# 🧪 TESTING CHECKLIST

**⚠️ CRITICAL: This checklist MUST be completed before pushing any changes to main**

## Pre-Push Testing Requirements

### 1. **Local Development Server Test**
- [ ] Start the development server: `npm run dev`
- [ ] Verify the server starts without errors
- [ ] Confirm the app is accessible at `http://localhost:3000` (or alternative port)
- [ ] Check that no build errors appear in the terminal

### 2. **Core Functionality Test**
- [ ] **Home Page**: Loads without errors
- [ ] **Authentication**: Sign in/out works correctly
- [ ] **Navigation**: All menu items work and redirect properly
- [ ] **API Health**: `/api/health` endpoint returns success
- [ ] **Database Connection**: No database connection errors in logs

### 3. **Feature-Specific Testing**

#### For API Changes:
- [ ] Test all affected API endpoints with Postman/curl
- [ ] Verify request/response formats are correct
- [ ] Check error handling works as expected
- [ ] Confirm logging appears in console (if logging changes)

#### For Frontend Changes:
- [ ] Test all affected pages/components
- [ ] Verify responsive design on different screen sizes
- [ ] Check for console errors in browser DevTools
- [ ] Test user interactions (forms, buttons, navigation)

#### For Database Changes:
- [ ] Run `npx prisma generate` to update client
- [ ] Test database operations (create, read, update, delete)
- [ ] Verify migrations work: `npx prisma migrate dev`
- [ ] Check Prisma Studio loads: `npx prisma studio`

### 4. **Error Handling Test**
- [ ] Test error boundaries work correctly
- [ ] Verify error messages are user-friendly
- [ ] Check that errors are logged properly
- [ ] Test network failure scenarios

### 5. **Performance Test**
- [ ] Check page load times are reasonable
- [ ] Verify no memory leaks (check browser memory usage)
- [ ] Test with larger datasets if applicable
- [ ] Monitor CPU usage during operations

### 6. **Cross-Browser Test**
- [ ] Test in Chrome (primary)
- [ ] Test in Firefox
- [ ] Test in Safari (if on Mac)
- [ ] Check mobile responsiveness

### 7. **Environment Variables Test**
- [ ] Verify all required env vars are set
- [ ] Test with production-like environment
- [ ] Check sensitive data is not exposed

### 8. **Logging Test** (if logging changes)
- [ ] Verify logs appear in console
- [ ] Check log levels are appropriate
- [ ] Confirm sensitive data is not logged
- [ ] Test error logging works

## Testing Commands

```bash
# Start development server
npm run dev

# Test API endpoints
curl http://localhost:3000/api/health
curl http://localhost:3000/api/ideas

# Check for TypeScript errors
npx tsc --noEmit

# Test database
npx prisma generate
npx prisma studio

# Check build
npm run build

# Run tests (if available)
npm test
```

## What to Look For

### ✅ **Good Signs:**
- Server starts without errors
- Pages load quickly
- No console errors
- API responses are correct
- Database operations work
- Logs are informative but not excessive

### ❌ **Red Flags:**
- Build errors
- Runtime errors in console
- API returning 500 errors
- Database connection failures
- Pages not loading
- Missing environment variables
- Excessive logging or missing logs

## Emergency Rollback Plan

If issues are discovered after push:
1. **Immediate**: Revert the last commit
2. **Investigate**: Identify the root cause
3. **Fix**: Apply the fix locally
4. **Test**: Complete this checklist again
5. **Deploy**: Only push after successful testing

## Testing Checklist Template

Copy this template for each feature/refactor:

```
## Testing Checklist for: [FEATURE_NAME]

**Date:** [DATE]
**Developer:** [NAME]
**Branch:** [BRANCH_NAME]

### Pre-Testing Setup
- [ ] Branch is up to date with main
- [ ] All dependencies installed
- [ ] Environment variables configured
- [ ] Database is seeded with test data

### Core Tests
- [ ] Development server starts successfully
- [ ] Home page loads without errors
- [ ] Authentication works
- [ ] Navigation works
- [ ] API health endpoint responds

### Feature-Specific Tests
- [ ] [SPECIFIC_TEST_1]
- [ ] [SPECIFIC_TEST_2]
- [ ] [SPECIFIC_TEST_3]

### Error Scenarios
- [ ] Invalid inputs handled gracefully
- [ ] Network errors handled
- [ ] Database errors handled
- [ ] Authentication errors handled

### Performance
- [ ] Page load times acceptable
- [ ] No memory leaks
- [ ] API response times reasonable

### Final Checks
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] All tests pass
- [ ] Ready for code review

**Tester:** [NAME]
**Date:** [DATE]
**Status:** ✅ PASSED / ❌ FAILED
```

## Remember

**🚨 NEVER PUSH TO MAIN WITHOUT COMPLETING THIS CHECKLIST**

**🚨 ALWAYS TEST LOCALLY FIRST**

**🚨 WHEN IN DOUBT, TEST MORE**

This checklist exists to prevent production issues and ensure code quality. Skipping it can lead to:
- Production outages
- User experience issues
- Debugging time waste
- Team productivity loss
- Reputation damage

**Take the time to test properly - it's always worth it!** 