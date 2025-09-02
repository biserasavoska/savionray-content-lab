# Organization Deletion System

## Overview

The Organization Deletion System provides a comprehensive, secure, and auditable way to delete organizations from the SavionRay Content Lab platform. It includes robust guardrails, cascade deletion handling, and comprehensive audit logging.

## 🛡️ Security Features

### Multi-Layer Validation
1. **Authentication**: Only authenticated users can access deletion endpoints
2. **Authorization**: Only super admins (ADMIN role) can delete organizations
3. **Session Validation**: Uses the session validation utility to ensure real user ID matching
4. **Pre-deletion Checks**: Multiple validation layers before allowing deletion

### Comprehensive Guardrails
- **Active Users Check**: Prevents deletion of organizations with active users
- **Content Preservation**: Blocks deletion if organization has any content data
- **System Safety**: Prevents deletion of the last organization in the system
- **Cascade Deletion**: Properly handles all related data in correct order

## 🔧 Technical Implementation

### API Endpoint: `DELETE /api/admin/organizations/[id]`

#### Request
```http
DELETE /api/admin/organizations/org_123
Authorization: Bearer <token>
```

#### Response (Success)
```json
{
  "message": "Organization deleted successfully",
  "deletedOrganization": {
    "id": "org_123",
    "name": "Example Organization",
    "slug": "example-org"
  }
}
```

#### Response (Error - Has Users)
```json
{
  "error": "Cannot delete organization with active users",
  "details": {
    "userCount": 5,
    "message": "Please remove all users from the organization before deletion"
  }
}
```

#### Response (Error - Has Content)
```json
{
  "error": "Cannot delete organization with existing content",
  "details": {
    "contentStats": {
      "ideas": 10,
      "contentDrafts": 5,
      "contentItems": 3,
      "deliveryPlans": 2,
      "scheduledPosts": 1,
      "feedback": 8,
      "uploads": 12
    },
    "message": "Please archive or transfer all content before deletion"
  }
}
```

### Deletion Process

#### 1. Pre-deletion Validation
```typescript
// Check for active users
if (organization._count.organizationUsers > 0) {
  return NextResponse.json({ error: 'Cannot delete organization with active users' }, { status: 400 })
}

// Check for content data
const hasContent = organization._count.ideas > 0 || 
                  organization._count.contentDrafts > 0 || 
                  // ... other content checks

// Check if last organization
const totalOrganizations = await prisma.organization.count()
if (totalOrganizations <= 1) {
  return NextResponse.json({ error: 'Cannot delete the last organization' }, { status: 400 })
}
```

#### 2. Cascade Deletion (Transaction)
```typescript
await prisma.$transaction(async (tx) => {
  // Delete in proper order (respecting foreign key constraints)
  
  // 1. Organization users
  await tx.organizationUser.deleteMany({
    where: { organizationId: params.id }
  })

  // 2. Scheduled posts
  await tx.scheduledPost.deleteMany({
    where: { 
      contentDraft: { organizationId: params.id }
    }
  })

  // 3. Feedback
  await tx.feedback.deleteMany({
    where: { organizationId: params.id }
  })

  // 4. Content items
  await tx.contentItem.deleteMany({
    where: { organizationId: params.id }
  })

  // 5. Content drafts
  await tx.contentDraft.deleteMany({
    where: { organizationId: params.id }
  })

  // 6. Content delivery plans and items
  await tx.contentDeliveryItem.deleteMany({
    where: { plan: { organizationId: params.id } }
  })
  await tx.contentDeliveryPlan.deleteMany({
    where: { organizationId: params.id }
  })

  // 7. Ideas
  await tx.idea.deleteMany({
    where: { organizationId: params.id }
  })

  // 8. Uploads
  await tx.upload.deleteMany({
    where: { organizationId: params.id }
  })

  // 9. Finally, delete the organization
  await tx.organization.delete({
    where: { id: params.id }
  })
})
```

## 🎨 User Interface

### OrganizationDeletionModal Component

A comprehensive modal that provides:

#### Features
- **Multi-step confirmation process**
- **Real-time validation checks**
- **Detailed content breakdown**
- **Visual status indicators**
- **Error handling and display**

#### Usage
```tsx
<OrganizationDeletionModal
  isOpen={deleteModalOpen}
  onClose={handleDeleteModalClose}
  onConfirm={handleDeleteConfirm}
  organization={selectedOrganization}
  isLoading={false}
/>
```

#### Props
```typescript
interface OrganizationDeletionModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  organization: {
    id: string
    name: string
    slug: string
    userCount: number
    stats: {
      ideas: number
      contentDrafts: number
      contentItems: number
      deliveryPlans: number
      scheduledPosts: number
      feedback: number
      uploads: number
    }
  }
  isLoading?: boolean
}
```

### Integration with Admin UI

The deletion functionality is integrated into the `OrganizationManagementList` component:

```tsx
<Button
  variant="destructive"
  size="sm"
  onClick={() => handleDeleteClick(org)}
  className="flex items-center gap-1"
>
  <Trash2 className="h-3 w-3" />
  Delete
</Button>
```

## 📝 Audit Logging

### Comprehensive Logging
All deletion attempts and results are logged with detailed information:

#### Pre-deletion Logging
```typescript
logger.info('Starting organization deletion process', {
  organizationId: params.id,
  organizationName: organization.name,
  deletedBy: realUserId,
  deletedByEmail: userEmail,
  contentStats: organization._count
})
```

#### Success Logging
```typescript
logger.info('Organization successfully deleted', {
  organizationId: params.id,
  organizationName: organization.name,
  organizationSlug: organization.slug,
  deletedBy: realUserId,
  deletedByEmail: userEmail,
  deletedAt: new Date().toISOString(),
  contentStats: organization._count
})
```

#### Error Logging
```typescript
logger.warn('Organization deletion blocked - has active users', {
  organizationId: params.id,
  organizationName: organization.name,
  userCount: organization._count.organizationUsers,
  deletedBy: realUserId,
  deletedByEmail: userEmail
})
```

## 🔒 Security Considerations

### Access Control
- **Role-based**: Only ADMIN role users can delete organizations
- **Session validation**: Uses real user ID from database, not session ID
- **Audit trail**: All actions are logged with user identification

### Data Protection
- **Cascade deletion**: Ensures no orphaned data remains
- **Transaction safety**: All deletions happen atomically
- **Content preservation**: Prevents accidental data loss

### System Integrity
- **Last organization protection**: Prevents system from having no organizations
- **Foreign key respect**: Deletes in proper order to avoid constraint violations
- **Rollback capability**: Transaction-based approach allows rollback on errors

## 🚨 Error Handling

### Client-side Error Handling
```typescript
const handleDeleteConfirm = async () => {
  try {
    const response = await fetch(`/api/admin/organizations/${selectedOrganization.id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to delete organization')
    }

    // Success handling
    setOrganizations(prev => prev.filter(org => org.id !== selectedOrganization.id))
  } catch (error) {
    setDeleteError(error instanceof Error ? error.message : 'Failed to delete organization')
  }
}
```

### Server-side Error Handling
```typescript
try {
  // Deletion logic
} catch (error) {
  logger.error('Error deleting organization', {
    organizationId: params.id,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined
  })
  
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}
```

## 📊 Monitoring and Analytics

### Key Metrics to Monitor
- **Deletion attempts**: Track how often deletions are attempted
- **Blocked deletions**: Monitor why deletions are blocked
- **Success rate**: Track successful vs failed deletions
- **User behavior**: Monitor which users are performing deletions

### Log Analysis
```typescript
// Example log queries for monitoring
// 1. All deletion attempts in the last 24 hours
// 2. Deletions blocked due to active users
// 3. Deletions blocked due to content data
// 4. Successful deletions with content stats
```

## 🧪 Testing

### Unit Tests
```typescript
describe('Organization Deletion API', () => {
  test('should block deletion with active users', async () => {
    // Test implementation
  })

  test('should block deletion with content data', async () => {
    // Test implementation
  })

  test('should successfully delete empty organization', async () => {
    // Test implementation
  })
})
```

### Integration Tests
```typescript
describe('Organization Deletion UI', () => {
  test('should show validation errors', async () => {
    // Test implementation
  })

  test('should require confirmation', async () => {
    // Test implementation
  })

  test('should handle deletion success', async () => {
    // Test implementation
  })
})
```

## 🔄 Future Enhancements

### Planned Features
- **Soft deletion**: Option to soft delete instead of hard delete
- **Bulk deletion**: Delete multiple organizations at once
- **Deletion scheduling**: Schedule deletions for later
- **Data export**: Export organization data before deletion
- **Recovery system**: Ability to recover deleted organizations

### Advanced Guardrails
- **Time-based restrictions**: Prevent deletion during business hours
- **Approval workflow**: Require multiple admin approvals
- **Notification system**: Notify stakeholders before deletion
- **Backup verification**: Ensure backups exist before deletion

## 📚 Usage Examples

### Basic Deletion Flow
1. Admin navigates to organization management
2. Clicks "Delete" button on organization
3. Modal opens showing validation status
4. If blocked, admin sees specific reasons
5. If allowed, admin proceeds through confirmation
6. Organization is deleted with full audit trail

### Error Scenarios
1. **Has Users**: Admin must remove all users first
2. **Has Content**: Admin must archive/transfer content first
3. **Last Organization**: System prevents deletion of last org
4. **Network Error**: UI shows error message with retry option

## 🛠️ Maintenance

### Regular Tasks
- **Log monitoring**: Review deletion logs regularly
- **Error analysis**: Analyze failed deletion attempts
- **Performance monitoring**: Track deletion performance
- **Security review**: Regular security audit of deletion process

### Troubleshooting
- **Common issues**: Document common problems and solutions
- **Error codes**: Maintain list of error codes and meanings
- **Recovery procedures**: Document how to recover from issues

---

*This documentation is maintained as part of the SavionRay Content Lab system. Last updated: 2025-01-01*
