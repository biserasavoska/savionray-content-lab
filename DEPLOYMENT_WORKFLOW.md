# 🚀 Deployment Workflow Guide

## Current Setup
- **Production**: `awake-surprise` project (deploys from `main` branch)
- **Staging**: `disciplined-presence` project (currently also deploys from `main` branch)

## 🎯 Recommended Workflow: Branch-Based Deployment

### Branch Strategy
```
main branch → Production (awake-surprise)
develop branch → Staging (disciplined-presence)
```

### Workflow Process
1. **Feature Development**: Work on feature branches
2. **Merge to Develop**: Merge features to `develop` branch
3. **Auto-Deploy to Staging**: Railway deploys `develop` to staging
4. **Test on Staging**: Verify everything works
5. **Merge to Main**: Merge `develop` to `main` branch
6. **Auto-Deploy to Production**: Railway deploys `main` to production

## 🔧 Setup Instructions

### Step 1: Create Develop Branch
```bash
git checkout -b develop
git push origin develop
```

### Step 2: Configure Railway Projects

#### Staging Project (disciplined-presence)
- **Branch**: `develop`
- **Auto-deploy**: ✅ Enabled
- **Environment**: `staging`

#### Production Project (awake-surprise)
- **Branch**: `main`
- **Auto-deploy**: ✅ Enabled
- **Environment**: `production`

### Step 3: Update Railway Settings

#### For Staging Project:
1. Go to Railway Dashboard
2. Select `disciplined-presence` project
3. Go to Settings → Source
4. Set branch to `develop`
5. Enable auto-deploy

#### For Production Project:
1. Go to Railway Dashboard
2. Select `awake-surprise` project
3. Go to Settings → Source
4. Set branch to `main`
5. Enable auto-deploy

## 📋 Daily Workflow

### For New Features:
```bash
# 1. Create feature branch
git checkout develop
git pull origin develop
git checkout -b feature/new-feature

# 2. Develop and commit
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature

# 3. Create PR to develop
# (via GitHub/GitLab interface)

# 4. After PR approval, merge to develop
git checkout develop
git pull origin develop
git merge feature/new-feature
git push origin develop

# 5. Railway auto-deploys to staging
# 6. Test on staging
# 7. If good, merge to main for production
```

### For Hotfixes:
```bash
# 1. Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/urgent-fix

# 2. Fix and commit
git add .
git commit -m "fix: urgent production fix"
git push origin hotfix/urgent-fix

# 3. Merge to main (production)
git checkout main
git merge hotfix/urgent-fix
git push origin main

# 4. Also merge to develop (staging)
git checkout develop
git merge hotfix/urgent-fix
git push origin develop
```

## 🛡️ Safety Features

### Environment Variables
- **Staging**: Use staging-specific URLs and secrets
- **Production**: Use production URLs and secrets
- **Never mix**: Staging should never use production database

### Database Separation
- **Staging DB**: Separate from production
- **Test Data**: Use seeded test data
- **No Production Data**: Never use real user data in staging

### Deployment Checks
- **Health Checks**: Both environments have health check endpoints
- **Rollback**: Railway allows easy rollback if needed
- **Monitoring**: LogRocket tracks both environments

## 🚨 Emergency Procedures

### Rollback Production
1. Go to Railway Dashboard
2. Select `awake-surprise` project
3. Go to Deployments
4. Click "Redeploy" on previous working deployment

### Rollback Staging
1. Go to Railway Dashboard
2. Select `disciplined-presence` project
3. Go to Deployments
4. Click "Redeploy" on previous working deployment

## 📊 Monitoring

### Staging Monitoring
- **URL**: Check staging URL for functionality
- **Logs**: Monitor Railway logs for errors
- **LogRocket**: Track user sessions and errors

### Production Monitoring
- **URL**: `https://app.savionray.com`
- **LogRocket**: Full production monitoring
- **Railway Logs**: Real-time error tracking

## ✅ Benefits of This Workflow

1. **Safety**: Staging tests before production
2. **Automation**: No manual deployment steps
3. **Rollback**: Easy to revert if issues
4. **Team Workflow**: Clear process for all team members
5. **Quality**: Forces testing before production release
