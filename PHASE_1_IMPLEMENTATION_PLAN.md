# Phase 1: Multi-Tenant Foundation Implementation

## 🎯 **Phase 1 Goals**
- Implement core multi-tenant database schema
- Update authentication system for organization support
- Create organization selection and routing
- Migrate existing data to multi-tenant structure

## 📋 **Implementation Steps**

### **Step 1: Database Schema Updates**

#### **1.1 Add New Models to Prisma Schema**

```prisma
// Add to prisma/schema.prisma

enum SubscriptionPlan {
  FREE
  STARTER
  PROFESSIONAL
  ENTERPRISE
}

enum SubscriptionStatus {
  ACTIVE
  TRIAL
  PAST_DUE
  CANCELLED
  SUSPENDED
}

enum BillingCycle {
  MONTHLY
  YEARLY
}

enum OrganizationRole {
  OWNER
  ADMIN
  MANAGER
  MEMBER
  VIEWER
}

enum BillingStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}

model Organization {
  id                String   @id @default(cuid())
  name              String
  slug              String   @unique
  domain            String?  @unique
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
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  invitedByUser  User?        @relation("UserInvites", fields: [invitedBy], references: [id])
  
  @@unique([organizationId, userId])
}

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
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
}
```

#### **1.2 Update Existing Models**

```prisma
// Update User model
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
  invitedUsers         OrganizationUser[]    @relation("UserInvites")
  accounts             Account[]
  sessions             Session[]
  // ... existing relations
}

// Update all content models to include organizationId
model Idea {
  id             String   @id @default(cuid())
  organizationId String   // NEW
  title          String
  description    String
  status         IdeaStatus @default(PENDING)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  createdById    String
  mediaType      MediaType?
  publishingDateTime DateTime?
  savedForLater  Boolean @default(false)
  contentType    ContentType?
  deliveryItemId String?
  
  // Relations
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  contentDrafts  ContentDraft[]
  createdBy      User         @relation(fields: [createdById], references: [id])
  deliveryItem   ContentDeliveryItem? @relation(fields: [deliveryItemId], references: [id])
  comments       IdeaComment[]
}

model ContentDraft {
  id             String          @id @default(cuid())
  organizationId String          // NEW
  status         DraftStatus     @default(DRAFT)
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
  createdById    String
  body           String
  metadata       Json?           @default("{\"contentType\": \"social-media\"}")
  ideaId         String
  contentType    ContentType
  
  // Relations
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  createdBy      User            @relation(fields: [createdById], references: [id])
  idea           Idea            @relation(fields: [ideaId], references: [id])
  feedbacks      Feedback[]
  media          Media[]
  scheduledPosts ScheduledPost[]
}

// Continue updating other models similarly...
```

### **Step 2: Create Migration Scripts**

#### **2.1 Data Migration Script**

```typescript
// scripts/migrate-to-multi-tenant.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateToMultiTenant() {
  console.log('Starting multi-tenant migration...')
  
  // 1. Create default organization
  const defaultOrg = await prisma.organization.create({
    data: {
      name: 'SavionRay',
      slug: 'savionray',
      domain: 'savionray.com',
      primaryColor: '#3B82F6',
      settings: {
        timezone: 'UTC',
        dateFormat: 'MM/DD/YYYY',
        currency: 'USD'
      }
    }
  })
  
  console.log('Created default organization:', defaultOrg.slug)
  
  // 2. Migrate existing users
  const users = await prisma.user.findMany()
  
  for (const user of users) {
    await prisma.organizationUser.create({
      data: {
        organizationId: defaultOrg.id,
        userId: user.id,
        role: user.role === 'ADMIN' ? 'OWNER' : 
              user.role === 'CLIENT' ? 'ADMIN' : 'MEMBER',
        isActive: true,
        joinedAt: user.createdAt || new Date()
      }
    })
  }
  
  console.log(`Migrated ${users.length} users`)
  
  // 3. Migrate existing content
  const ideas = await prisma.idea.findMany()
  for (const idea of ideas) {
    await prisma.idea.update({
      where: { id: idea.id },
      data: { organizationId: defaultOrg.id }
    })
  }
  
  const drafts = await prisma.contentDraft.findMany()
  for (const draft of drafts) {
    await prisma.contentDraft.update({
      where: { id: draft.id },
      data: { organizationId: defaultOrg.id }
    })
  }
  
  // Continue with other content types...
  
  console.log('Migration completed successfully!')
}

migrateToMultiTenant()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

### **Step 3: Update Authentication System**

#### **3.1 Enhanced Auth Configuration**

```typescript
// src/lib/auth.ts
import { Session } from 'next-auth'
import { Prisma } from '@prisma/client'
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { NextAuthOptions } from "next-auth"
import { prisma } from "./prisma"
import CredentialsProvider from "next-auth/providers/credentials"
import LinkedInProvider from "next-auth/providers/linkedin"
import { UserRole, OrganizationRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

export interface ExtendedSession extends Session {
  user: {
    id: string
    email: string
    name: string
    role: UserRole
    isSuperAdmin: boolean
    currentOrganizationId?: string
    currentOrganizationSlug?: string
    currentOrganizationRole?: OrganizationRole
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role as UserRole
        token.isSuperAdmin = user.isSuperAdmin
      }
      return token
    },
    async session({ session, token }): Promise<ExtendedSession> {
      if (session?.user) {
        session.user.id = token.sub as string
        session.user.role = token.role as UserRole
        session.user.isSuperAdmin = token.isSuperAdmin as boolean
        
        // Get user's organizations
        const userOrgs = await prisma.organizationUser.findMany({
          where: { userId: token.sub as string, isActive: true },
          include: { organization: true }
        })
        
        // Set current organization (default to first active org)
        if (userOrgs.length > 0) {
          const currentOrg = userOrgs[0]
          session.user.currentOrganizationId = currentOrg.organizationId
          session.user.currentOrganizationSlug = currentOrg.organization.slug
          session.user.currentOrganizationRole = currentOrg.role
        }
      }
      return session as ExtendedSession
    },
    async redirect({ url, baseUrl }) {
      // Redirect to organization dashboard after login
      return baseUrl + '/dashboard';
    },
  },
  providers: [
    // ... existing providers with updated logic
  ]
}
```

#### **3.2 Organization Context Provider**

```typescript
// src/contexts/OrganizationContext.tsx
'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import type { Organization, OrganizationUser } from '@prisma/client'

interface OrganizationContextType {
  currentOrganization: Organization | null
  currentUserRole: OrganizationUser['role'] | null
  userOrganizations: Array<Organization & { role: OrganizationUser['role'] }>
  switchOrganization: (orgSlug: string) => Promise<void>
  isLoading: boolean
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined)

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null)
  const [userOrganizations, setUserOrganizations] = useState<Array<Organization & { role: OrganizationUser['role'] }>>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.id) {
      loadUserOrganizations()
    }
  }, [session?.user?.id])

  const loadUserOrganizations = async () => {
    try {
      const response = await fetch('/api/organizations/user')
      const data = await response.json()
      
      setUserOrganizations(data.organizations)
      
      // Set current organization from session or default
      const currentOrgSlug = session?.user?.currentOrganizationSlug
      const currentOrg = data.organizations.find((org: any) => org.slug === currentOrgSlug)
      setCurrentOrganization(currentOrg || data.organizations[0] || null)
    } catch (error) {
      console.error('Failed to load organizations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const switchOrganization = async (orgSlug: string) => {
    try {
      const response = await fetch('/api/organizations/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationSlug: orgSlug })
      })
      
      if (response.ok) {
        // Reload session to get updated organization
        window.location.reload()
      }
    } catch (error) {
      console.error('Failed to switch organization:', error)
    }
  }

  return (
    <OrganizationContext.Provider value={{
      currentOrganization,
      currentUserRole: userOrganizations.find(org => org.id === currentOrganization?.id)?.role || null,
      userOrganizations,
      switchOrganization,
      isLoading
    }}>
      {children}
    </OrganizationContext.Provider>
  )
}

export function useOrganization() {
  const context = useContext(OrganizationContext)
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider')
  }
  return context
}
```

### **Step 4: Update API Routes**

#### **4.1 Organization API Routes**

```typescript
// src/app/api/organizations/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const organizations = await prisma.organizationUser.findMany({
      where: { userId: session.user.id, isActive: true },
      include: { organization: true }
    })

    return NextResponse.json({
      organizations: organizations.map(ou => ({
        ...ou.organization,
        role: ou.role
      }))
    })
  } catch (error) {
    console.error('Failed to fetch organizations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, slug, domain } = await request.json()

    // Validate slug uniqueness
    const existingOrg = await prisma.organization.findUnique({
      where: { slug }
    })

    if (existingOrg) {
      return NextResponse.json({ error: 'Organization slug already exists' }, { status: 400 })
    }

    // Create organization
    const organization = await prisma.organization.create({
      data: {
        name,
        slug,
        domain,
        settings: {
          timezone: 'UTC',
          dateFormat: 'MM/DD/YYYY',
          currency: 'USD'
        }
      }
    })

    // Add creator as owner
    await prisma.organizationUser.create({
      data: {
        organizationId: organization.id,
        userId: session.user.id,
        role: 'OWNER',
        isActive: true,
        joinedAt: new Date()
      }
    })

    return NextResponse.json({ organization })
  } catch (error) {
    console.error('Failed to create organization:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

#### **4.2 Organization Switch API**

```typescript
// src/app/api/organizations/switch/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { organizationSlug } = await request.json()

    // Verify user has access to this organization
    const orgUser = await prisma.organizationUser.findFirst({
      where: {
        userId: session.user.id,
        organization: { slug: organizationSlug },
        isActive: true
      },
      include: { organization: true }
    })

    if (!orgUser) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Update session with new organization
    // Note: In a real implementation, you'd update the session token
    // For now, we'll return the organization data
    
    return NextResponse.json({
      organization: orgUser.organization,
      role: orgUser.role
    })
  } catch (error) {
    console.error('Failed to switch organization:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

### **Step 5: Update Navigation and Layout**

#### **5.1 Organization Switcher Component**

```typescript
// src/components/OrganizationSwitcher.tsx
'use client'

import { useState } from 'react'
import { useOrganization } from '@/contexts/OrganizationContext'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

export default function OrganizationSwitcher() {
  const { currentOrganization, userOrganizations, switchOrganization, isLoading } = useOrganization()
  const [isOpen, setIsOpen] = useState(false)

  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>
  }

  if (!currentOrganization) {
    return null
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <span>{currentOrganization.name}</span>
        <ChevronDownIcon className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            {userOrganizations.map((org) => (
              <button
                key={org.id}
                onClick={() => {
                  switchOrganization(org.slug)
                  setIsOpen(false)
                }}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  org.id === currentOrganization.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="font-medium">{org.name}</div>
                <div className="text-xs text-gray-500 capitalize">{org.role}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

### **Step 6: Update Existing Components**

#### **6.1 Update Navigation Component**

```typescript
// src/components/Navigation.tsx
'use client'

import { useSession } from 'next-auth/react'
import { useOrganization } from '@/contexts/OrganizationContext'
import OrganizationSwitcher from './OrganizationSwitcher'

export default function Navigation() {
  const { data: session } = useSession()
  const { currentOrganization } = useOrganization()

  if (!session || !currentOrganization) {
    return null
  }

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <OrganizationSwitcher />
            <div className="ml-10 flex items-baseline space-x-4">
              <a href={`/${currentOrganization.slug}/dashboard`} className="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                Dashboard
              </a>
              <a href={`/${currentOrganization.slug}/ideas`} className="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                Ideas
              </a>
              <a href={`/${currentOrganization.slug}/content`} className="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                Content
              </a>
              {/* Add more navigation items */}
            </div>
          </div>
          
          <div className="flex items-center">
            {/* User menu */}
          </div>
        </div>
      </div>
    </nav>
  )
}
```

## 🚀 **Implementation Checklist**

### **Database & Schema**
- [ ] Add new models to Prisma schema
- [ ] Create and run migration
- [ ] Create data migration script
- [ ] Test migration with existing data

### **Authentication & Session**
- [ ] Update auth configuration
- [ ] Add organization context to session
- [ ] Create OrganizationContext provider
- [ ] Update session types

### **API Routes**
- [ ] Create organization CRUD routes
- [ ] Create organization switch route
- [ ] Update existing routes for organization filtering
- [ ] Add organization access middleware

### **UI Components**
- [ ] Create OrganizationSwitcher component
- [ ] Update Navigation component
- [ ] Add organization context to layout
- [ ] Update URL structure

### **Testing**
- [ ] Test organization creation
- [ ] Test user invitation
- [ ] Test organization switching
- [ ] Test data isolation
- [ ] Test existing functionality

## 📝 **Next Steps After Phase 1**

1. **Phase 2**: Implement data isolation middleware
2. **Phase 3**: Add team management features
3. **Phase 4**: Implement billing system
4. **Phase 5**: Add organization-specific branding

This foundation will provide the core multi-tenant architecture needed to support multiple organizations while maintaining data isolation and security. 