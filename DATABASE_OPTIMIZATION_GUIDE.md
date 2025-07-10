# Database Optimization Guide

## 🎯 Overview
This guide provides comprehensive database optimization strategies to improve query performance, reduce load times, and enhance overall application performance.

## 📊 Current Database Analysis

### Database: PostgreSQL (via Prisma)
- **ORM**: Prisma
- **Type**: Relational Database
- **Host**: Railway (Cloud)

## 🔍 Performance Bottlenecks Identified

### 1. **Missing Indexes**
Critical queries that need optimization:

```sql
-- User authentication queries
SELECT * FROM "User" WHERE email = ?
SELECT * FROM "User" WHERE id = ?

-- Organization queries
SELECT * FROM "Organization" WHERE id = ?
SELECT * FROM "OrganizationMember" WHERE userId = ? AND organizationId = ?

-- Content queries
SELECT * FROM "Content" WHERE organizationId = ? ORDER BY createdAt DESC
SELECT * FROM "Idea" WHERE organizationId = ? AND status = ?

-- Draft queries
SELECT * FROM "ContentDraft" WHERE ideaId = ?
SELECT * FROM "ContentDraft" WHERE createdById = ? ORDER BY updatedAt DESC
```

### 2. **N+1 Query Problems**
Common patterns causing multiple database round trips:

```typescript
// ❌ BAD: N+1 queries
const ideas = await prisma.idea.findMany()
for (const idea of ideas) {
  const drafts = await prisma.contentDraft.findMany({
    where: { ideaId: idea.id }
  })
}

// ✅ GOOD: Single query with includes
const ideas = await prisma.idea.findMany({
  include: {
    drafts: true
  }
})
```

## 🚀 Optimization Strategies

### 1. **Index Optimization**

#### Add Critical Indexes
```sql
-- User table indexes
CREATE INDEX CONCURRENTLY idx_user_email ON "User"(email);
CREATE INDEX CONCURRENTLY idx_user_id ON "User"(id);

-- Organization indexes
CREATE INDEX CONCURRENTLY idx_org_member_user_org ON "OrganizationMember"(userId, organizationId);
CREATE INDEX CONCURRENTLY idx_org_member_user ON "OrganizationMember"(userId);
CREATE INDEX CONCURRENTLY idx_org_member_org ON "OrganizationMember"(organizationId);

-- Content indexes
CREATE INDEX CONCURRENTLY idx_content_org_created ON "Content"(organizationId, createdAt DESC);
CREATE INDEX CONCURRENTLY idx_content_status ON "Content"(status);
CREATE INDEX CONCURRENTLY idx_content_created_by ON "Content"(createdById);

-- Idea indexes
CREATE INDEX CONCURRENTLY idx_idea_org_status ON "Idea"(organizationId, status);
CREATE INDEX CONCURRENTLY idx_idea_created_at ON "Idea"(createdAt DESC);
CREATE INDEX CONCURRENTLY idx_idea_created_by ON "Idea"(createdById);

-- Draft indexes
CREATE INDEX CONCURRENTLY idx_draft_idea ON "ContentDraft"(ideaId);
CREATE INDEX CONCURRENTLY idx_draft_created_by_updated ON "ContentDraft"(createdById, updatedAt DESC);
CREATE INDEX CONCURRENTLY idx_draft_status ON "ContentDraft"(status);

-- Composite indexes for common queries
CREATE INDEX CONCURRENTLY idx_content_org_status_created ON "Content"(organizationId, status, createdAt DESC);
CREATE INDEX CONCURRENTLY idx_idea_org_status_created ON "Idea"(organizationId, status, createdAt DESC);
```

#### Prisma Schema Updates
```prisma
model User {
  id    String @id @default(cuid())
  email String @unique
  
  @@index([email])
  @@index([id])
}

model OrganizationMember {
  id             String @id @default(cuid())
  userId         String
  organizationId String
  
  @@index([userId, organizationId])
  @@index([userId])
  @@index([organizationId])
  @@unique([userId, organizationId])
}

model Content {
  id             String @id @default(cuid())
  organizationId String
  status         String
  createdById    String
  createdAt      DateTime @default(now())
  
  @@index([organizationId, createdAt(sort: Desc)])
  @@index([status])
  @@index([createdById])
  @@index([organizationId, status, createdAt(sort: Desc)])
}

model Idea {
  id             String @id @default(cuid())
  organizationId String
  status         String
  createdById    String
  createdAt      DateTime @default(now())
  
  @@index([organizationId, status])
  @@index([createdAt(sort: Desc)])
  @@index([createdById])
  @@index([organizationId, status, createdAt(sort: Desc)])
}

model ContentDraft {
  id          String @id @default(cuid())
  ideaId      String
  createdById String
  status      String
  updatedAt   DateTime @updatedAt
  
  @@index([ideaId])
  @@index([createdById, updatedAt(sort: Desc)])
  @@index([status])
}
```

### 2. **Query Optimization**

#### Optimize Common Queries

```typescript
// ❌ BEFORE: Inefficient queries
export async function getUserContent(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  })
  
  const organizations = await prisma.organizationMember.findMany({
    where: { userId },
    include: { organization: true }
  })
  
  const content = []
  for (const org of organizations) {
    const orgContent = await prisma.content.findMany({
      where: { organizationId: org.organizationId }
    })
    content.push(...orgContent)
  }
  
  return { user, content }
}

// ✅ AFTER: Optimized single query
export async function getUserContent(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      organizations: {
        include: {
          organization: {
            include: {
              content: {
                orderBy: { createdAt: 'desc' },
                take: 50 // Limit results
              }
            }
          }
        }
      }
    }
  })
}

// ✅ Alternative: Use raw SQL for complex queries
export async function getUserContentRaw(userId: string) {
  return prisma.$queryRaw`
    SELECT c.*, o.name as organizationName
    FROM "Content" c
    JOIN "Organization" o ON c."organizationId" = o.id
    JOIN "OrganizationMember" om ON o.id = om."organizationId"
    WHERE om."userId" = ${userId}
    ORDER BY c."createdAt" DESC
    LIMIT 50
  `
}
```

### 3. **Pagination Optimization**

```typescript
// ❌ BEFORE: Offset-based pagination (slow for large datasets)
export async function getContentPaginated(page: number, limit: number) {
  const offset = (page - 1) * limit
  return prisma.content.findMany({
    skip: offset,
    take: limit,
    orderBy: { createdAt: 'desc' }
  })
}

// ✅ AFTER: Cursor-based pagination (fast for large datasets)
export async function getContentCursor(cursor?: string, limit: number = 20) {
  return prisma.content.findMany({
    take: limit,
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1 // Skip the cursor
    }),
    orderBy: { createdAt: 'desc' }
  })
}

// ✅ Usage example
async function loadMoreContent() {
  const content = await getContentCursor(lastContentId, 20)
  return content
}
```

### 4. **Connection Pooling**

```typescript
// prisma/client.ts
import { PrismaClient } from '@prisma/client'

declare global {
  var __prisma: PrismaClient | undefined
}

export const prisma = globalThis.__prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma
}

// Connection pool configuration
const DATABASE_URL = process.env.DATABASE_URL + '?connection_limit=20&pool_timeout=20'
```

### 5. **Caching Strategy**

```typescript
// utils/cache.ts
import { Redis } from 'ioredis'

class DatabaseCache {
  private redis: Redis
  private defaultTTL = 300 // 5 minutes

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL!)
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await this.redis.get(key)
      return cached ? JSON.parse(cached) : null
    } catch {
      return null
    }
  }

  async set(key: string, value: any, ttl: number = this.defaultTTL): Promise<void> {
    try {
      await this.redis.setex(key, ttl, JSON.stringify(value))
    } catch (error) {
      console.error('Cache set error:', error)
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key)
    } catch (error) {
      console.error('Cache delete error:', error)
    }
  }

  // Cache invalidation patterns
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern)
      if (keys.length > 0) {
        await this.redis.del(...keys)
      }
    } catch (error) {
      console.error('Cache invalidation error:', error)
    }
  }
}

export const cache = new DatabaseCache()

// Cached query wrapper
export async function cachedQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Try cache first
  const cached = await cache.get<T>(key)
  if (cached) return cached

  // Execute query
  const result = await queryFn()
  
  // Cache result
  await cache.set(key, result, ttl)
  
  return result
}

// Usage example
export async function getCachedUserContent(userId: string) {
  return cachedQuery(
    `user:${userId}:content`,
    () => getUserContent(userId),
    300 // 5 minutes
  )
}
```

## 📈 Performance Monitoring

### 1. **Query Performance Monitoring**

```typescript
// utils/queryMonitor.ts
export class QueryMonitor {
  static logSlowQueries = true
  static slowQueryThreshold = 1000 // 1 second

  static async monitor<T>(
    queryName: string,
    queryFn: () => Promise<T>
  ): Promise<T> {
    const start = Date.now()
    
    try {
      const result = await queryFn()
      const duration = Date.now() - start
      
      if (this.logSlowQueries && duration > this.slowQueryThreshold) {
        console.warn(`[SLOW QUERY] ${queryName}: ${duration}ms`)
      }
      
      return result
    } catch (error) {
      console.error(`[QUERY ERROR] ${queryName}:`, error)
      throw error
    }
  }
}

// Usage
export async function getContent(id: string) {
  return QueryMonitor.monitor(
    'getContent',
    () => prisma.content.findUnique({ where: { id } })
  )
}
```

### 2. **Database Health Checks**

```typescript
// utils/dbHealth.ts
export async function checkDatabaseHealth() {
  const start = Date.now()
  
  try {
    // Simple query to test connection
    await prisma.$queryRaw`SELECT 1`
    
    const responseTime = Date.now() - start
    
    return {
      status: 'healthy',
      responseTime,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    }
  }
}

// Connection pool stats
export async function getConnectionStats() {
  try {
    const stats = await prisma.$queryRaw`
      SELECT 
        count(*) as total_connections,
        count(*) FILTER (WHERE state = 'active') as active_connections,
        count(*) FILTER (WHERE state = 'idle') as idle_connections
      FROM pg_stat_activity 
      WHERE datname = current_database()
    `
    
    return stats[0]
  } catch (error) {
    console.error('Failed to get connection stats:', error)
    return null
  }
}
```

## 🛠️ Implementation Checklist

### High Priority
- [ ] Add missing database indexes
- [ ] Implement cursor-based pagination
- [ ] Fix N+1 query problems
- [ ] Set up connection pooling
- [ ] Add query performance monitoring

### Medium Priority
- [ ] Implement Redis caching
- [ ] Add database health checks
- [ ] Optimize complex queries with raw SQL
- [ ] Set up query logging in production
- [ ] Implement cache invalidation strategies

### Low Priority
- [ ] Set up read replicas for read-heavy operations
- [ ] Implement database partitioning for large tables
- [ ] Add query result compression
- [ ] Set up automated performance testing

## 🚨 Migration Commands

### Apply Index Changes
```bash
# Generate migration
npx prisma migrate dev --name add-performance-indexes

# Apply to production
npx prisma migrate deploy
```

### Monitor Query Performance
```bash
# Enable query logging
export DATABASE_URL="${DATABASE_URL}?logging=true"

# Run performance tests
npm run test:performance
```

## 📊 Expected Performance Improvements

| Optimization | Expected Improvement |
|--------------|---------------------|
| **Database Indexes** | 60-80% faster queries |
| **N+1 Query Fixes** | 70-90% fewer database calls |
| **Cursor Pagination** | 95% faster for large datasets |
| **Connection Pooling** | 40-60% better concurrency |
| **Redis Caching** | 90-95% faster repeated queries |

## 🔍 Performance Testing

### Query Performance Tests
```typescript
// tests/performance/database.test.ts
describe('Database Performance', () => {
  test('User content query should be under 500ms', async () => {
    const start = Date.now()
    const result = await getUserContent('test-user-id')
    const duration = Date.now() - start
    
    expect(duration).toBeLessThan(500)
    expect(result).toBeDefined()
  })
  
  test('Pagination should handle 10k items efficiently', async () => {
    const start = Date.now()
    const result = await getContentCursor(undefined, 20)
    const duration = Date.now() - start
    
    expect(duration).toBeLessThan(200)
    expect(result.length).toBeLessThanOrEqual(20)
  })
})
```

### Load Testing
```bash
# Install artillery for load testing
npm install -g artillery

# Run load tests
artillery run database-load-test.yml
```

## 📝 Monitoring Dashboard

Key metrics to track:
- **Query Duration**: Average and p95 query times
- **Connection Pool**: Active/idle connections
- **Cache Hit Rate**: Redis cache effectiveness
- **Database CPU/Memory**: Resource utilization
- **Slow Query Count**: Number of queries > 1s

## 🎯 Success Metrics

After implementing optimizations, you should see:
- ✅ **90% reduction** in average query time
- ✅ **80% reduction** in database connections
- ✅ **95% cache hit rate** for repeated queries
- ✅ **Zero N+1 queries** in application logs
- ✅ **Sub-200ms response times** for common operations

---

**Next Steps**: Implement high-priority optimizations first, then monitor performance improvements before proceeding to medium-priority items.