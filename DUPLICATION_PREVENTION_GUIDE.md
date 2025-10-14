# Database Seeding Prevention Guide

## Root Cause Analysis

### What Happened
- **243 duplicate ideas** and **243 duplicate delivery plans** were created
- **Root cause**: Seeding script ran multiple times due to flawed detection logic
- **Problem**: Used `.create()` instead of `.upsert()` for data that should be unique

### The Problematic Code

**In `prisma/seed.ts`:**
```typescript
// ❌ PROBLEM: Creates duplicates every time
prisma.idea.create({
  data: { title: 'Summer Marketing Campaign', ... }
})

// ❌ PROBLEM: Creates duplicates every time  
prisma.contentDeliveryPlan.create({
  data: { name: 'Q3 2024 Content Plan', ... }
})
```

**In `scripts/start-railway.sh`:**
```bash
# ❌ PROBLEM: Flawed detection logic
if npx prisma migrate deploy 2>&1 | grep -q "P3005"; then
  echo "Skipping seeding"
else
  npx prisma db seed  # Runs even when data exists!
fi
```

## Prevention Solutions

### 1. Fix Seeding Script (CRITICAL)

**Replace `.create()` with `.upsert()` for unique data:**

```typescript
// ✅ SOLUTION: Use upsert for unique content
const approvedIdeas = await Promise.all([
  prisma.idea.upsert({
    where: { 
      title_createdById: {  // Composite unique constraint needed
        title: 'Summer Marketing Campaign',
        createdById: creative.id
      }
    },
    update: {}, // Don't update if exists
    create: {
      title: 'Summer Marketing Campaign',
      description: 'Create engaging social media content...',
      status: IDEA_STATUS.APPROVED,
      contentType: CONTENT_TYPE.SOCIAL_MEDIA_POST,
      publishingDateTime: new Date('2024-07-01'),
      createdById: creative.id,
      organizationId: defaultOrg.id,
    },
  }),
  // ... repeat for other ideas
])

const deliveryPlan = await prisma.contentDeliveryPlan.upsert({
  where: { 
    name_organizationId: {  // Composite unique constraint needed
      name: 'Q3 2024 Content Plan',
      organizationId: defaultOrg.id
    }
  },
  update: {},
  create: {
    name: 'Q3 2024 Content Plan',
    description: 'Content delivery plan for Q3 2024',
    // ... rest of data
  },
})
```

### 2. Add Database Constraints (RECOMMENDED)

**Add unique constraints to prevent duplicates:**

```sql
-- Add to schema.prisma or create migration
ALTER TABLE "Idea" ADD CONSTRAINT "Idea_title_createdById_key" 
UNIQUE ("title", "createdById");

ALTER TABLE "ContentDeliveryPlan" ADD CONSTRAINT "ContentDeliveryPlan_name_organizationId_key" 
UNIQUE ("name", "organizationId");
```

### 3. Fix Railway Startup Script (CRITICAL)

**Replace flawed detection logic:**

```bash
# ✅ SOLUTION: Better detection logic
echo "--- Checking if database needs seeding ---"

# Count existing ideas (more reliable than user count)
IDEA_COUNT=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) as count FROM \"Idea\";" 2>/dev/null | grep -E '[0-9]+' | tail -1 | tr -d ' ' || echo "0")

if [ "$IDEA_COUNT" -gt 0 ]; then
  echo "--- Database has data (${IDEA_COUNT} ideas), skipping seeding ---"
else
  echo "--- Database is empty, running seed command ---"
  npx prisma db seed || echo "--- Seeding failed, continuing anyway ---"
fi
```

### 4. Add Seeding Safety Checks (RECOMMENDED)

**Add to seed script:**

```typescript
async function main() {
  // ✅ SOLUTION: Check if data already exists
  const existingIdeas = await prisma.idea.count()
  const existingPlans = await prisma.contentDeliveryPlan.count()
  
  if (existingIdeas > 0 || existingPlans > 0) {
    console.log('⚠️  Database already has data, skipping seeding')
    console.log(`Found ${existingIdeas} ideas and ${existingPlans} delivery plans`)
    return
  }
  
  // ... rest of seeding logic
}
```

### 5. Environment-Specific Seeding (BEST PRACTICE)

**Create separate seed files:**

- `prisma/seed-dev.ts` - Development data
- `prisma/seed-staging.ts` - Staging data  
- `prisma/seed-prod.ts` - Production data (minimal)

**Update package.json:**
```json
{
  "prisma": {
    "seed": "ts-node prisma/seed-dev.ts"
  },
  "scripts": {
    "seed:dev": "ts-node prisma/seed-dev.ts",
    "seed:staging": "ts-node prisma/seed-staging.ts",
    "seed:prod": "ts-node prisma/seed-prod.ts"
  }
}
```

## Implementation Priority

### 🔴 CRITICAL (Fix Immediately)
1. **Fix seeding script** - Replace `.create()` with `.upsert()`
2. **Fix Railway startup script** - Better detection logic
3. **Add safety checks** - Prevent seeding when data exists

### 🟡 IMPORTANT (Next Sprint)
4. **Add database constraints** - Prevent duplicates at DB level
5. **Environment-specific seeding** - Separate seed files

### 🟢 NICE TO HAVE (Future)
6. **Seeding monitoring** - Log when seeding runs
7. **Automated cleanup** - Script to detect and clean duplicates

## Testing the Fix

### Before Deploying:
1. **Test locally**: Run `npm run seed` multiple times
2. **Verify no duplicates**: Check database after each run
3. **Test Railway deployment**: Deploy to staging first

### After Deploying:
1. **Monitor logs**: Watch for seeding attempts
2. **Verify data**: Check that no new duplicates appear
3. **Test edge cases**: Database reset scenarios

## Emergency Cleanup (If It Happens Again)

```sql
-- Quick cleanup script for bulk duplicates
-- Run this if seeding creates duplicates again

-- Delete duplicate ideas (keep first of each title)
DELETE FROM "Idea" 
WHERE id NOT IN (
  SELECT MIN(id) 
  FROM "Idea" 
  GROUP BY title, "createdById"
);

-- Delete duplicate delivery plans (keep first of each name)
DELETE FROM "ContentDeliveryPlan" 
WHERE id NOT IN (
  SELECT MIN(id) 
  FROM "ContentDeliveryPlan" 
  GROUP BY name, "organizationId"
);
```

## Summary

The duplication issue was caused by:
1. **Seeding script using `.create()` instead of `.upsert()`**
2. **Flawed detection logic in Railway startup script**
3. **No database-level duplicate prevention**

**Fix by implementing the solutions above in order of priority.**
