# 🚀 Quick Deployment Reference

## ⚠️ CRITICAL: Staging-First Rule
**NEVER deploy to production without validating staging first!**

## Standard Process
```bash
# 1. Test locally
npm run dev

# 2. Deploy to staging FIRST
git checkout develop
git merge feature-branch
git push origin develop

# 3. VALIDATE STAGING (MANDATORY)
# - Check Railway dashboard for disciplined-presence
# - Test all functionality on staging
# - Verify no errors

# 4. Deploy to production (ONLY after staging validation)
git checkout main
git pull origin main
git merge develop
git push origin main

# 5. Validate production (https://app.savionray.com)
```

## Railway Projects
- **Staging**: `disciplined-presence` (develop branch) - TEST HERE FIRST
- **Production**: `awake-surprise` (main branch) - ONLY AFTER STAGING VALIDATION

## Key Points
- ✅ ALWAYS test on staging first
- ✅ NEVER skip staging validation
- ✅ Monitor Railway dashboard during deployment
- ✅ Check LogRocket for errors
- ✅ Both projects have auto-deploy enabled

*Created: 2025-09-11*
