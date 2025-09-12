# 🚀 Production Deployment Process Guide

## Overview
This guide documents the complete process for deploying fixes and features from development to production, including staging validation.

## Current Environment Setup
- **Development**: Local development with `npm run dev`
- **Staging**: `disciplined-presence` project (deploys from `develop` branch)
- **Production**: `awake-surprise` project (deploys from `main` branch)

## 🎯 Standard Deployment Workflow

### Step 1: Development & Testing
```bash
# Work on feature/fix branch
git checkout -b fix/issue-description
# Make changes, test locally
npm run dev
# Test thoroughly on localhost:3000
```

### Step 2: Deploy to Staging FIRST
```bash
# Switch to develop branch
git checkout develop

# Merge feature branch
git merge fix/issue-description

# Push to staging (auto-deploys)
git push origin develop
```

### Step 3: Validate Staging (CRITICAL STEP)
- Monitor Railway dashboard for `disciplined-presence` project
- Test all functionality on staging environment
- Verify fixes work correctly
- Check for any new errors in logs
- **DO NOT PROCEED TO PRODUCTION UNTIL STAGING IS VALIDATED**

### Step 4: Deploy to Production (ONLY AFTER STAGING VALIDATION)
```bash
# ONLY proceed if staging validation is successful
# Switch to main branch
git checkout main

# Pull latest changes
git pull origin main

# Merge develop branch
git merge develop

# Push to production (auto-deploys)
git push origin main
```

### Step 5: Validate Production
- Monitor Railway dashboard for `awake-surprise` project
- Test production site at `https://app.savionray.com`
- Verify all fixes are working
- Check LogRocket for errors

## 🔧 Railway Configuration

### Staging Project (`disciplined-presence`)
- **Branch**: `develop`
- **Auto-deploy**: ✅ Enabled
- **URL**: Check Railway dashboard for staging URL

### Production Project (`awake-surprise`)
- **Branch**: `main`
- **Auto-deploy**: ✅ Enabled
- **URL**: `https://app.savionray.com`

## ⚠️ CRITICAL: Staging-First Rule

**NEVER deploy to production without validating staging first!**

The staging environment (`disciplined-presence`) is your safety net. Always:
1. Deploy to staging first
2. Test thoroughly on staging
3. Only deploy to production after staging validation

## 📋 Pre-Deployment Checklist

### Before Staging:
- [ ] All changes tested locally
- [ ] No console errors in development
- [ ] Code reviewed and committed
- [ ] Branch merged to `develop`

### Before Production (MANDATORY):
- [ ] Staging deployment successful
- [ ] All functionality tested on staging
- [ ] No errors in staging logs
- [ ] LogRocket shows clean sessions
- [ ] **Staging validation completed and approved**
- [ ] Ready for production release

## 🚨 Emergency Procedures

### Rollback Production
1. Go to Railway Dashboard
2. Select `awake-surprise` project
3. Go to Deployments tab
4. Click "Redeploy" on previous working deployment

### Rollback Staging
1. Go to Railway Dashboard
2. Select `disciplined-presence` project
3. Go to Deployments tab
4. Click "Redeploy" on previous working deployment

## 📊 Monitoring & Validation

### Staging Validation
- Test content creation and review functionality
- Verify organization context works correctly
- Check API endpoints respond properly
- Monitor for any new errors

### Production Validation
- Test all critical user flows
- Verify LogRocket is tracking properly
- Check performance metrics
- Monitor error rates

## 🔍 Troubleshooting Common Issues

### Deployment Not Starting
- Check Railway project branch configuration
- Verify auto-deploy is enabled
- Try manual deployment trigger

### Build Failures
- Check build logs in Railway dashboard
- Verify all dependencies are installed
- Check for TypeScript/compilation errors

### Runtime Errors
- Check application logs in Railway
- Verify environment variables are set
- Check database connectivity

## 📝 Recent Deployments

### Content Creation 404 Fix (2025-09-11)
**Issues Fixed:**
- Content review page 404 errors
- Organization context missing in API calls
- StatusBadge component undefined status handling
- Date serialization errors in ContentReviewList

**Files Modified:**
- `src/app/content-review/[id]/page.tsx`
- `src/app/api/drafts/[id]/route.ts`
- `src/components/ui/common/StatusBadge.tsx`
- `src/app/content-review/ContentReviewList.tsx`

**Deployment Process:**
1. ✅ Fixed locally and tested
2. ✅ Deployed to staging (`develop` branch)
3. ✅ Validated on staging environment
4. ✅ Merged to production (`main` branch)
5. ✅ Deployed to production successfully

## 🎯 Best Practices

1. **Always test on staging first** - Never skip staging validation
2. **Monitor deployments** - Watch Railway dashboard during deployment
3. **Test thoroughly** - Verify all functionality works after deployment
4. **Keep documentation updated** - Record what was deployed and when
5. **Use descriptive commit messages** - Make it clear what was changed
6. **Clean up branches** - Delete feature branches after successful merge

## 📞 Support

- **Railway Dashboard**: https://railway.app/dashboard
- **Production URL**: https://app.savionray.com
- **LogRocket**: Monitor user sessions and errors
- **GitHub**: https://github.com/biserasavoska/savionray-content-lab

---

*Last Updated: 2025-09-11*
*Next Review: After next major deployment*
