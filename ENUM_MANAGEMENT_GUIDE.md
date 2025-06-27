# Enum Management Guide

## Overview

This guide explains how to properly manage enums in the SavionRay Content Lab application to prevent enum mismatches between the database and application code.

## The Problem

Enum mismatches occur when:
- The Prisma schema defines enum values that don't match the application code
- Hardcoded enum strings are used instead of centralized constants
- Database migrations don't properly handle enum changes
- Different environments have different enum definitions

## The Solution

We've implemented a centralized enum management system with the following components:

### 1. Centralized Enum Constants (`src/lib/utils/enum-constants.ts`)

All enum values are defined in one place with TypeScript types and validation helpers.

```typescript
// Example usage
import { IDEA_STATUS, DRAFT_STATUS } from '@/lib/utils/enum-constants'

// ✅ Good - using centralized constants
const ideas = await prisma.idea.findMany({
  where: { status: IDEA_STATUS.APPROVED }
})

// ❌ Bad - hardcoded strings
const ideas = await prisma.idea.findMany({
  where: { status: 'APPROVED' }
})
```

### 2. Validation Script (`scripts/validate-enum-consistency.js`)

Automatically validates that:
- Prisma schema enums match centralized constants
- No hardcoded enum strings exist in the codebase
- All enum values are consistent across the application

### 3. Pre-deployment Validation

The `predeploy` script automatically runs enum validation before deployment.

## How to Add New Enum Values

### Step 1: Update Centralized Constants

1. Open `src/lib/utils/enum-constants.ts`
2. Add the new enum value to the appropriate constant object
3. Update the TypeScript type if needed

```typescript
export const DRAFT_STATUS = {
  DRAFT: 'DRAFT',
  AWAITING_FEEDBACK: 'AWAITING_FEEDBACK',
  AWAITING_REVISION: 'AWAITING_REVISION',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  PUBLISHED: 'PUBLISHED',
  NEW_STATUS: 'NEW_STATUS' // ← Add new value here
} as const
```

### Step 2: Update Prisma Schema

1. Open `prisma/schema.prisma`
2. Add the new enum value to the corresponding enum definition

```prisma
enum DraftStatus {
  DRAFT
  AWAITING_FEEDBACK
  AWAITING_REVISION
  APPROVED
  REJECTED
  PUBLISHED
  NEW_STATUS // ← Add new value here
}
```

### Step 3: Generate Prisma Client

```bash
npx prisma generate
```

### Step 4: Create Database Migration

```bash
npx prisma migrate dev --name add_new_enum_value
```

### Step 5: Validate Consistency

```bash
npm run validate:enums
```

## Deployment Checklist

Before deploying to staging or production:

1. **Run enum validation:**
   ```bash
   npm run validate:enums
   ```

2. **Check for hardcoded strings:**
   The validation script will warn about any hardcoded enum strings.

3. **Test database migrations:**
   ```bash
   npx prisma migrate deploy
   ```

## Troubleshooting Enum Mismatches

### Common Issues

1. **"Invalid enum value" errors**
   - Run `npm run validate:enums` to identify inconsistencies
   - Update centralized constants and Prisma schema
   - Regenerate Prisma client: `npx prisma generate`

2. **Database has old enum values**
   - Use the fix script: `node scripts/fix-enum-mismatches.js`
   - Or reset the database: `npm run seed`

### Emergency Fixes

If you encounter enum mismatches in production:

1. **Quick fix script:**
   ```bash
   node scripts/fix-enum-mismatches.js
   ```

2. **Reset and reseed:**
   ```bash
   npm run seed
   ```

## Best Practices

### ✅ Do's

- Always use centralized enum constants
- Run validation before deploying
- Update both constants and schema together
- Test enum changes in development first

### ❌ Don'ts

- Don't hardcode enum strings
- Don't update only one side (constants OR schema)
- Don't skip validation before deployment

## Tools and Scripts

- `npm run validate:enums` - Main validation script
- `node scripts/check-enum-values.js` - Check current database values
- `node scripts/fix-enum-mismatches.js` - Emergency fix script

## Support and Resources

- **Enum Constants:** `src/lib/utils/enum-constants.ts`
- **Validation Script:** `scripts/validate-enum-consistency.js`
- **Fix Script:** `scripts/fix-enum-mismatches.js`
- **Prisma Schema:** `prisma/schema.prisma` 