# SavionRay Content Lab

A comprehensive content management platform for agencies and organizations.

## 🏢 **Terminology Clarification**

**Important**: In this codebase, we use the following terminology consistently:
- **"Organization"** = **"Client"** - Each organization in the system represents a client company
- **"Agency"** = The team managing multiple organizations/clients
- **"Users"** = People within organizations (admins, creatives, clients)

When we refer to "clients" in UI text or documentation, we mean "organizations" in the backend models.

## Features

- Multi-tenant organization management
- Role-based access control
- Content creation and approval workflows
- Billing and subscription management
- Organization invitation system

## Recent Updates

- Fixed TypeScript errors for production deployment
- Implemented comprehensive client invitation system
- Added billing and subscription management

A Next.js + TypeScript + Prisma/Tailwind content management app for managing and scheduling social media content.

## Description

This project is a modern content management system built to replace the Bubble-based "Content Lab." It provides a streamlined workflow for content creation, review, and scheduling across various social media platforms.

## Features

- Next.js 14 with App Router
- TypeScript for type safety
- Prisma ORM with PostgreSQL
- Tailwind CSS for styling
- LinkedIn OAuth integration
- Content scheduling and management
- User authentication and authorization

## Installation

1. Clone the repository:
```bash
git clone https://gitlab.com/biserasavoska/savionray-content-lab.git
cd savionray-content-lab
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Edit `.env` with your configuration.

4. Set up the database:
```bash
npx prisma migrate dev
```

5. Start the development server:
```bash
npm run dev
```

## 🚨 **Troubleshooting & Common Issues**

### **Quick Fix for Most Issues:**
```bash
# Emergency cleanup and restart
pkill -f "next dev"
rm -rf .next
rm -rf node_modules
npm install
npm run dev
```

### **Common Problems:**
- **Vendor chunk errors** (`Cannot find module './vendor-chunks/jose.js'`)
- **Static asset MIME type errors** (CSS/JS returning as `text/html`)
- **404 errors for JavaScript chunks**
- **Authentication endpoints crashing**

### **Documentation:**
- 📚 **[Webpack Configuration Guide](./WEBPACK_CONFIGURATION_GUIDE.md)** - Comprehensive troubleshooting
- 🚨 **[Quick Troubleshooting Reference](./TROUBLESHOOTING_QUICK_REFERENCE.md)** - Emergency fixes
- 🔧 **[Testing Checklist](./TESTING_CHECKLIST.md)** - Pre-deployment testing

### **Root Cause:**
Most issues stem from **aggressive webpack optimizations** that interfere with NextAuth's vendor chunk generation. The solution is to use **minimal, safe webpack configuration**.

## 🧪 Testing Requirements

**⚠️ CRITICAL: Before pushing any changes to main, you MUST complete the testing checklist**

### Pre-Push Testing Checklist
- [ ] **Complete the full testing checklist**: See [TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md)
- [ ] **Test locally first**: Always test on your local development environment
- [ ] **Verify core functionality**: Home page, authentication, navigation, API endpoints
- [ ] **Check for errors**: No build errors, runtime errors, or console errors
- [ ] **Test affected features**: All modified functionality works as expected

### Quick Testing Commands
```bash
# Start development server
npm run dev

# Test API health
curl http://localhost:3000/api/health

# Check for TypeScript errors
npx tsc --noEmit

# Test database connection
npx prisma studio
```

**🚨 NEVER PUSH TO MAIN WITHOUT TESTING LOCALLY FIRST**

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. **🧪 TEST THOROUGHLY** - Complete the [testing checklist](./TESTING_CHECKLIST.md)
4. Create a merge request
5. Wait for review and approval

**⚠️ IMPORTANT: Testing is mandatory before any merge to main**

## Project Status

Active development - Building core features and integrations.

## License

Proprietary - All rights reserved.

## Integration Workflow, Branch Cleanup, and Rollback Plan

### Integration Workflow
- Feature and refactor branches are developed separately from `main`.
- To combine major features and technical debt fixes, create an integration branch from `main` (e.g., `feature/unified-content-with-refactors`).
- Merge feature and refactor branches into the integration branch, resolving any conflicts.
- Test thoroughly on the integration branch.
- Open a Pull Request from the integration branch to `main`.
- As a solo maintainer, use the "bypass rules and merge" option if branch protection is enabled.

### Branch Cleanup
- After merging, delete the integration and feature branches both locally and remotely to keep the branch list tidy:
  ```bash
  git branch -d feature/unified-content-with-refactors
  git push origin --delete feature/unified-content-with-refactors
  git branch -d feature/unified-content-item-entity
  git push origin --delete feature/unified-content-item-entity
  ```

### Staging and Production Deployment
- After merging to `main`, deploy to staging and test all major flows.
- When staging is stable, deploy to production.
- Run any required database migrations in both environments.
- Update environment variables if needed.

### Rollback Plan
- If a deployment causes issues, you can roll back to a previous tag, commit, or branch:
  - **To a tag:**
    ```bash
    git checkout v1.0.0
    git push origin v1.0.0:main --force
    ```
  - **To a previous commit:**
    ```bash
    git checkout <commit-sha>
    git push origin <commit-sha>:main --force
    ```
  - **To revert a merge:**
    ```bash
    git revert -m 1 <merge-commit-sha>
    git push origin main
    ```
- Always test after rollback and redeploy to staging/production as needed.

---
This workflow ensures a clean, maintainable codebase and safe deployments, even as a solo maintainer.

# Trigger pipeline
# Trigger pipeline again
# Trigger pipeline for deployment
# Trigger pipeline again
# Build fix - Wed Jun 25 08:10:53 CEST 2025
# Railway deployment trigger - Tue Aug 19 12:52:25 CEST 2025
# Railway Deployment Trigger
# Force Railway deployment - Wed Sep  3 15:02:32 CEST 2025
