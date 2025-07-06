# SavionRay Content Lab

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

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Create a merge request
4. Wait for review and approval

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
