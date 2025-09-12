# 🚀 Quick Deployment Reference

## Standard Process
```bash
# 1. Test locally
npm run dev

# 2. Deploy to staging
git checkout develop
git merge feature-branch
git push origin develop

# 3. Validate staging (check Railway dashboard)

# 4. Deploy to production
git checkout main
git pull origin main
git merge develop
git push origin main

# 5. Validate production (https://app.savionray.com)
```

## Railway Projects
- **Staging**: `disciplined-presence` (develop branch)
- **Production**: `awake-surprise` (main branch)

## Key Points
- Always test on staging first
- Monitor Railway dashboard during deployment
- Check LogRocket for errors
- Both projects have auto-deploy enabled

*Created: 2025-09-11*
