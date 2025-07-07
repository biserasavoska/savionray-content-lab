# Multi-Tenant Architecture Plan

## 🎯 **Overview**
Transform the current single-tenant content management system into a robust multi-tenant platform that can serve multiple organizations simultaneously with proper data isolation, billing, and team management.

## 🏗️ **Architecture Components**

### **1. Organization Model**
```prisma
model Organization {
  id                String   @id @default(cuid())
  name              String
  slug              String   @unique // URL-friendly identifier
  domain            String?  @unique // Custom domain support
  logo              String?
  primaryColor      String?
  settings          Json     @default("{}")
  subscriptionPlan  SubscriptionPlan @default(FREE)
  subscriptionStatus SubscriptionStatus @default(ACTIVE)
  trialEndsAt       DateTime?
  billingCycle      BillingCycle @default(MONTHLY)
  maxUsers          Int      @default(5)
  maxStorageGB      Int      @default(10)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  // Relations
  users             OrganizationUser[]
  ideas             Idea[]
  contentDrafts     ContentDraft[]
  deliveryPlans     ContentDeliveryPlan[]
  contentItems      ContentItem[]
  media             Media[]
  billingHistory    BillingRecord[]
}
```

### **2. Enhanced User Management**
```prisma
model OrganizationUser {
  id             String   @id @default(cuid())
  organizationId String
  userId         String
  role           OrganizationRole @default(MEMBER)
  permissions    Json     @default("[]")
  isActive       Boolean  @default(true)
  invitedBy      String?
  invitedAt      DateTime @default(now())
  joinedAt       DateTime?
  
  // Relations
  organization   Organization @relation(fields: [organizationId], references: [id])
  user           User         @relation(fields: [userId], references: [id])
  invitedByUser  User?        @relation("UserInvites", fields: [invitedBy], references: [id])
  
  @@unique([organizationId, userId])
}

model User {
  id                   String                @id @default(cuid())
  name                 String?
  email                String?               @unique
  emailVerified        DateTime?
  image                String?
  role                 UserRole              @default(CREATIVE)
  password             String?
  isSuperAdmin         Boolean               @default(false)
  
  // Relations
  organizations        OrganizationUser[]
  accounts             Account[]
  sessions             Session[]
  // ... existing relations
}
```

### **3. Billing & Subscription System**
```prisma
model SubscriptionPlan {
  id          String   @id @default(cuid())
  name        String   @unique
  price       Float
  currency    String   @default("USD")
  interval    BillingCycle
  maxUsers    Int
  maxStorageGB Int
  features    Json     @default("[]")
  isActive    Boolean  @default(true)
  
  // Relations
  organizations Organization[]
}

model BillingRecord {
  id             String   @id @default(cuid())
  organizationId String
  amount         Float
  currency       String   @default("USD")
  status         BillingStatus @default(PENDING)
  description    String
  invoiceUrl     String?
  paidAt         DateTime?
  createdAt      DateTime @default(now())
  
  // Relations
  organization   Organization @relation(fields: [organizationId], references: [id])
}
```

### **4. Data Isolation Strategy**
All existing models will be updated to include `organizationId`:

```prisma
model Idea {
  id             String   @id @default(cuid())
  organizationId String   // NEW: Organization isolation
  title          String
  // ... existing fields
  
  // Relations
  organization   Organization @relation(fields: [organizationId], references: [id])
  // ... existing relations
}
```

## 🔐 **Security & Data Isolation**

### **1. Middleware-Based Isolation**
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const session = await getToken({ req: request })
  const organizationSlug = request.nextUrl.pathname.split('/')[1]
  
  if (session && organizationSlug) {
    // Verify user has access to this organization
    const hasAccess = await verifyOrganizationAccess(session.userId, organizationSlug)
    if (!hasAccess) {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }
}
```

### **2. Database-Level Isolation**
```typescript
// prisma.ts
export const prisma = new PrismaClient().$extends({
  query: {
    $allModels: {
      async $allOperations({ args, query, operation, model }) {
        // Automatically filter by organizationId for all queries
        if (model !== 'Organization' && model !== 'User') {
          const organizationId = getCurrentOrganizationId()
          if (organizationId) {
            args.where = { ...args.where, organizationId }
          }
        }
        return query(args)
      }
    }
  }
})
```

## 🎨 **User Experience Design**

### **1. Organization Selection**
- **Organization switcher** in navigation
- **URL-based organization routing**: `/org-slug/dashboard`
- **Organization-specific branding** (logo, colors)

### **2. Team Management**
- **Invite team members** via email
- **Role-based permissions** within organization
- **Team activity dashboard**

### **3. Billing Dashboard**
- **Usage metrics** (users, storage, content)
- **Subscription management**
- **Payment history**

## 📊 **Implementation Phases**

### **Phase 1: Foundation (Week 1-2)**
1. **Database Schema Migration**
   - Add Organization model
   - Add OrganizationUser model
   - Update existing models with organizationId
   - Create migration scripts

2. **Authentication Updates**
   - Multi-organization login
   - Organization selection
   - Session management

### **Phase 2: Data Isolation (Week 3-4)**
1. **Middleware Implementation**
   - Organization access verification
   - URL-based routing
   - Security middleware

2. **Database Queries**
   - Automatic organization filtering
   - Prisma extensions
   - Query optimization

### **Phase 3: Organization Management (Week 5-6)**
1. **Organization CRUD**
   - Create/edit organizations
   - Organization settings
   - Team management

2. **User Management**
   - Invite team members
   - Role management
   - Permission system

### **Phase 4: Billing & Subscriptions (Week 7-8)**
1. **Subscription Plans**
   - Plan definitions
   - Usage tracking
   - Billing integration

2. **Admin Dashboard**
   - Organization overview
   - Usage analytics
   - Billing management

### **Phase 5: UI/UX & Polish (Week 9-10)**
1. **Organization Switcher**
   - Navigation updates
   - Organization branding
   - URL structure

2. **Testing & Optimization**
   - Performance testing
   - Security audit
   - User acceptance testing

## 🔧 **Technical Implementation Details**

### **1. URL Structure**
```
/                           # Organization selection
/org-slug/                   # Organization dashboard
/org-slug/ideas             # Organization-specific ideas
/org-slug/content           # Organization-specific content
/org-slug/settings          # Organization settings
/org-slug/billing           # Billing dashboard
```

### **2. Environment Variables**
```env
# Multi-tenant configuration
NEXT_PUBLIC_MULTI_TENANT=true
NEXT_PUBLIC_DEFAULT_ORG_SLUG=savionray
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### **3. API Routes Structure**
```
/api/organizations          # Organization CRUD
/api/organizations/[slug]   # Organization-specific data
/api/organizations/[slug]/users
/api/organizations/[slug]/billing
```

## 🚀 **Benefits of This Architecture**

### **For SavionRay:**
- **Scalable revenue model** with subscription tiers
- **Multiple client support** without data mixing
- **Professional billing system**
- **Usage analytics** and insights

### **For Clients:**
- **Isolated data** and privacy
- **Custom branding** and settings
- **Team collaboration** features
- **Professional interface**

### **For Development:**
- **Clean separation** of concerns
- **Scalable architecture**
- **Easy maintenance** and updates
- **Future-proof** design

## 📋 **Migration Strategy**

### **1. Data Migration**
- Create default organization for existing data
- Migrate existing users to organization members
- Preserve all existing relationships

### **2. Gradual Rollout**
- Start with new organizations
- Migrate existing clients gradually
- Maintain backward compatibility

### **3. Testing Strategy**
- Unit tests for isolation logic
- Integration tests for multi-tenant flows
- Performance testing with multiple organizations

This architecture will transform the current single-tenant system into a robust, scalable multi-tenant platform capable of serving multiple organizations while maintaining data isolation, security, and professional billing capabilities. 