# Content Management System - Unified Architecture (System 2)

## Overview

This document outlines the **unified content management system** that consolidates all content workflows into a single, consistent architecture. This system replaces the legacy dual-system approach and provides a clear, maintainable foundation for all content operations.

## 🎯 **Core Principles**

1. **Single Source of Truth**: All content follows one unified workflow
2. **Consistent Naming**: Standardized terminology across all components
3. **Clear Status Transitions**: Well-defined content lifecycle stages
4. **Unified Data Models**: Consistent database schema and relationships

## 🏗️ **System Architecture**

### **Content Flow**
```
IDEA → CONTENT_REVIEW → APPROVED → REJECTED → PUBLISHED
  ↓           ↓           ↓         ↓         ↓
Draft    Feedback    Final    Revision   Live
Stage    Stage      Stage    Stage      Stage
```

## 📊 **Data Models & Enums**

### **1. ContentItem Model (Primary)**
```typescript
model ContentItem {
  id              String            @id @default(cuid())
  title           String            // Content title
  description     String?           // Content description
  body            String?           // AI-generated or edited content
  status          ContentItemStatus // Current workflow stage
  contentType     ContentType       // Type of content
  mediaType       MediaType?        // Media format
  publishingDateTime DateTime?       // Scheduled publish date
  organizationId  String            // Multi-tenancy
  createdById     String            // Creator reference
  updatedAt       DateTime          @updatedAt
  createdAt       DateTime          @default(now())
  
  // Relationships
  organization    Organization      @relation(fields: [organizationId], references: [id])
  createdBy       User             @relation(fields: [createdById], references: [id])
  feedback        Feedback[]
  media           Media[]
}
```

### **2. ContentItemStatus Enum (Unified)**
```typescript
enum ContentItemStatus {
  IDEA              // Initial content idea
  CONTENT_REVIEW    // Under review/editing
  APPROVED          // Approved for publication
  REJECTED          // Rejected/needs revision
  PUBLISHED         // Live/published content
}
```

### **3. WorkflowStage Enum (Workflow Tracking)**
```typescript
enum WorkflowStage {
  IDEA              // Initial stage
  CONTENT_REVIEW    // Review and editing
  APPROVED          // Approval stage
  REJECTED          // Rejection stage
  PUBLISHED         // Publication stage
}
```

### **4. ContentType Enum**
```typescript
enum ContentType {
  SOCIAL_MEDIA_POST    // Social media content
  BLOG_POST           // Blog articles
  NEWSLETTER          // Email newsletters
  WHITEPAPER          // Technical documents
  CASE_STUDY          // Success stories
  VIDEO_SCRIPT        // Video content scripts
}
```

### **5. MediaType Enum**
```typescript
enum MediaType {
  IMAGE               // Static images
  VIDEO               // Video content
  AUDIO               // Audio content
  DOCUMENT            // PDFs, docs
  INFOGRAPHIC         // Visual data
}
```

## 🔄 **Workflow Stages & Transitions**

### **Stage 1: IDEA**
- **Purpose**: Initial content concept
- **Actions**: Create, edit, submit for review
- **Next Stage**: `CONTENT_REVIEW`
- **Permissions**: All users can create

### **Stage 2: CONTENT_REVIEW**
- **Purpose**: Content creation and editing
- **Actions**: Generate AI content, edit, request feedback
- **Next Stages**: `APPROVED`, `REJECTED`
- **Permissions**: Creatives, admins

### **Stage 3: APPROVED**
- **Purpose**: Final approval stage
- **Actions**: Final review, schedule publication
- **Next Stage**: `PUBLISHED`
- **Permissions**: Clients, admins

### **Stage 4: REJECTED**
- **Purpose**: Revision required
- **Actions**: Provide feedback, return to editing
- **Next Stage**: `CONTENT_REVIEW`
- **Permissions**: Clients, admins

### **Stage 5: PUBLISHED**
- **Purpose**: Live content
- **Actions**: Monitor performance, archive
- **Next Stage**: None (final stage)
- **Permissions**: Admins only

## 🚫 **Deprecated/Removed Models**

### **Legacy Models (No Longer Used)**
- ❌ `Idea` model with `IdeaStatus`
- ❌ `ContentDraft` model with `DraftStatus`
- ❌ `ContentItem` model with old status system

### **Migration Path**
All existing data should be migrated to the unified `ContentItem` model with `ContentItemStatus`.

## 📁 **File Structure & Naming**

### **API Routes**
```
/api/content/                    # Main content endpoints
├── [id]/                        # Individual content item
│   ├── route.ts                 # GET, PUT, DELETE
│   ├── approve/route.ts         # Approval endpoint
│   ├── reject/route.ts          # Rejection endpoint
│   └── publish/route.ts         # Publication endpoint
├── route.ts                     # List, create content
└── search/route.ts              # Content search
```

### **Page Routes**
```
/app/content/                     # Content management
├── page.tsx                      # Content list
├── [id]/                         # Individual content
│   ├── page.tsx                  # View content
│   ├── edit/page.tsx             # Edit content
│   └── review/page.tsx           # Review content
└── create/page.tsx               # Create new content
```

### **Component Naming**
```
ContentList.tsx                   # Main content list
ContentItem.tsx                   # Individual content display
ContentEditor.tsx                 # Content editing interface
ContentReview.tsx                 # Review interface
ContentApproval.tsx               # Approval interface
```

## 🔧 **Implementation Guidelines**

### **1. Status Updates**
Always use `ContentItemStatus` enum values:
```typescript
// ✅ CORRECT
await prisma.contentItem.update({
  where: { id: contentId },
  data: { status: 'CONTENT_REVIEW' }
})

// ❌ INCORRECT - Don't use legacy status values
await prisma.contentItem.update({
  where: { id: contentId },
  data: { status: 'DRAFT' } // This doesn't exist in ContentItemStatus
})
```

### **2. API Response Format**
Standardize all API responses:
```typescript
interface ContentItemResponse {
  id: string
  title: string
  description?: string
  body?: string
  status: ContentItemStatus
  contentType: ContentType
  mediaType?: MediaType
  publishingDateTime?: Date
  createdAt: Date
  updatedAt: Date
  createdBy: {
    id: string
    name: string
    email: string
  }
  organization: {
    id: string
    name: string
    slug: string
  }
}
```

### **3. Frontend State Management**
Use consistent state variables:
```typescript
const [contentItems, setContentItems] = useState<ContentItem[]>([])
const [selectedStatus, setSelectedStatus] = useState<ContentItemStatus>('IDEA')
const [isLoading, setIsLoading] = useState(false)
const [error, setError] = useState<string | null>(null)
```

## 🧪 **Testing & Validation**

### **Unit Tests**
Test all status transitions:
```typescript
describe('Content Status Transitions', () => {
  test('IDEA → CONTENT_REVIEW', async () => {
    // Test transition logic
  })
  
  test('CONTENT_REVIEW → APPROVED', async () => {
    // Test approval logic
  })
  
  test('CONTENT_REVIEW → REJECTED', async () => {
    // Test rejection logic
  })
})
```

### **Integration Tests**
Test complete workflows:
```typescript
describe('Content Workflow', () => {
  test('Complete content lifecycle', async () => {
    // Test from IDEA to PUBLISHED
  })
})
```

## 📝 **Migration Checklist**

### **Phase 1: Schema Updates**
- [ ] Update Prisma schema to use unified models
- [ ] Remove deprecated enums and models
- [ ] Update database migrations

### **Phase 2: API Updates**
- [ ] Update all API routes to use new models
- [ ] Implement new status transition logic
- [ ] Update response formats

### **Phase 3: Frontend Updates**
- [ ] Update all components to use new data structures
- [ ] Implement new status displays
- [ ] Update navigation and routing

### **Phase 4: Testing & Validation**
- [ ] Test all workflows end-to-end
- [ ] Validate data integrity
- [ ] Performance testing

## 🚨 **Breaking Changes**

### **What Will Break**
1. **API Endpoints**: Old status values will cause validation errors
2. **Frontend Components**: Components expecting old data structures
3. **Database Queries**: Queries using deprecated models

### **How to Handle**
1. **Gradual Migration**: Migrate one component at a time
2. **Feature Flags**: Use feature flags for gradual rollout
3. **Backward Compatibility**: Maintain old endpoints during transition

## 📚 **Additional Resources**

### **Related Documentation**
- [API Reference](./API_REFERENCE.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [Frontend Components](./FRONTEND_COMPONENTS.md)

### **Code Examples**
- [Content Creation](./examples/content-creation.md)
- [Status Transitions](./examples/status-transitions.md)
- [API Integration](./examples/api-integration.md)

---

## 🔄 **Version History**

- **v2.0.0** - Unified system implementation
- **v1.0.0** - Legacy dual-system (deprecated)

---

**Last Updated**: August 20, 2025  
**Maintainer**: Development Team  
**Status**: Active Implementation
