# User Roles & Permissions Analysis

## Overview

The SavionRay Content Lab application implements a **dual-layer role system** with both **System Roles** and **Organization Roles** to provide granular access control in a multi-tenant environment.

---

## 🔐 System-Level User Roles

### 1. **CREATIVE** Role
**Purpose**: Content creators and writers who generate ideas and content

**Default Permissions**:
- ✅ Create content (ideas, drafts, media)
- ✅ View all content within organization
- ✅ Edit own content
- ✅ Delete own content
- ✅ View dashboard
- ❌ Approve ideas
- ❌ Manage organization settings
- ❌ Manage team members

**Typical Use Cases**:
- Content writers
- Social media managers
- Graphic designers
- Copywriters

**Database Default**: `@default(CREATIVE)`

---

### 2. **CLIENT** Role
**Purpose**: Clients who review and approve content

**Default Permissions**:
- ✅ Approve ideas
- ✅ View all content within organization
- ✅ View dashboard
- ❌ Create content
- ❌ Edit content
- ❌ Delete content
- ❌ Manage organization settings

**Typical Use Cases**:
- Client stakeholders
- Marketing managers
- Brand managers
- Content approvers

---

### 3. **ADMIN** Role
**Purpose**: System administrators with full access

**Default Permissions**:
- ✅ Create content
- ✅ Approve ideas
- ✅ View all content
- ✅ Edit own content
- ✅ Delete own content
- ✅ View dashboard
- ✅ Manage organization settings (if also has org admin role)
- ✅ Manage team members (if also has org admin role)

**Typical Use Cases**:
- Agency owners
- Project managers
- System administrators

---

## 🏢 Organization-Level Roles

### 1. **OWNER** Role
**Hierarchy Level**: 4 (Highest)
**Purpose**: Full control over the organization

**Permissions**:
- ✅ All organization permissions
- ✅ Cannot be removed from organization
- ✅ Can transfer ownership
- ✅ Manage billing and subscriptions
- ✅ Invite/remove any user
- ✅ Change any user's role

**Restrictions**:
- Cannot change own role (except to transfer ownership)
- Cannot remove themselves from organization

---

### 2. **ADMIN** Role
**Hierarchy Level**: 3
**Purpose**: Organization administration

**Permissions**:
- ✅ Manage team members
- ✅ Change user roles (except OWNER)
- ✅ Remove users (except OWNER)
- ✅ View organization settings
- ✅ Manage content workflows
- ✅ Access all organization data

**Restrictions**:
- Cannot change OWNER role
- Cannot remove OWNER from organization

---

### 3. **MANAGER** Role
**Hierarchy Level**: 2
**Purpose**: Team and project management

**Permissions**:
- ✅ Manage content workflows
- ✅ Approve/reject content
- ✅ Assign tasks to team members
- ✅ View team performance
- ✅ Access most organization data

**Restrictions**:
- Cannot manage team members
- Cannot change user roles
- Cannot access billing information

---

### 4. **MEMBER** Role
**Hierarchy Level**: 1
**Purpose**: Active team member

**Permissions**:
- ✅ Create and edit content
- ✅ View team content
- ✅ Participate in workflows
- ✅ Access assigned projects

**Restrictions**:
- Cannot manage other users
- Cannot approve content (unless also has CLIENT system role)
- Limited access to organization settings

---

### 5. **VIEWER** Role
**Hierarchy Level**: 0 (Lowest)
**Purpose**: Read-only access

**Permissions**:
- ✅ View content (read-only)
- ✅ View team activities
- ✅ Access reports and analytics

**Restrictions**:
- Cannot create or edit content
- Cannot participate in workflows
- Cannot manage anything

---

## 🔄 Role Hierarchy System

```typescript
const roleHierarchy = {
  'OWNER': 4,    // Highest
  'ADMIN': 3,
  'MANAGER': 2,
  'MEMBER': 1,
  'VIEWER': 0    // Lowest
}
```

**Permission Check Logic**:
```typescript
function hasPermission(organizationRole: string, requiredRole: string): boolean {
  const userLevel = roleHierarchy[organizationRole] ?? 0;
  const requiredLevel = roleHierarchy[requiredRole] ?? 0;
  return userLevel >= requiredLevel;
}
```

---

## 🎯 Combined Role Examples

### Example 1: Content Creator
- **System Role**: `CREATIVE`
- **Organization Role**: `MEMBER`
- **Capabilities**: Create content, edit own work, view team content
- **Restrictions**: Cannot approve content or manage team

### Example 2: Client Approver
- **System Role**: `CLIENT`
- **Organization Role**: `VIEWER`
- **Capabilities**: Approve content, view all content (read-only)
- **Restrictions**: Cannot create content or manage organization

### Example 3: Agency Owner
- **System Role**: `ADMIN`
- **Organization Role**: `OWNER`
- **Capabilities**: Full access to everything
- **Restrictions**: None

### Example 4: Project Manager
- **System Role**: `ADMIN`
- **Organization Role**: `MANAGER`
- **Capabilities**: Manage workflows, approve content, view team data
- **Restrictions**: Cannot manage team members or billing

---

## 🔧 Technical Implementation

### Database Schema
```prisma
model User {
  id           String   @id @default(cuid())
  role         UserRole @default(CREATIVE)  // System role
  isSuperAdmin Boolean  @default(false)
  // ... other fields
}

model OrganizationUser {
  id             String           @id @default(cuid())
  organizationId String
  userId         String
  role           OrganizationRole @default(MEMBER)  // Organization role
  permissions    Json             @default("[]")
  isActive       Boolean          @default(true)
  // ... other fields
}
```

### Permission Checking
```typescript
// System-level permissions
export function isCreative(session: Session | null): boolean {
  return session?.user?.role === 'CREATIVE'
}

// Organization-level permissions
export function hasPermission(
  organizationRole: string,
  requiredRole: string
): boolean {
  const roleHierarchy = {
    'OWNER': 4, 'ADMIN': 3, 'MANAGER': 2, 'MEMBER': 1, 'VIEWER': 0
  };
  const userLevel = roleHierarchy[organizationRole] ?? 0;
  const requiredLevel = roleHierarchy[requiredRole] ?? 0;
  return userLevel >= requiredLevel;
}
```

---

## 🚀 Special Cases

### Super Admin
- **Field**: `User.isSuperAdmin`
- **Purpose**: System-wide administration
- **Capabilities**: Access all organizations, manage system settings
- **Use Case**: Platform administrators

### Organization Owner
- **Special Protection**: Cannot be removed or have role changed by others
- **Ownership Transfer**: Can transfer ownership to another user
- **Billing Access**: Full access to billing and subscription management

---

## 📊 Permission Matrix

| System Role | Org Role | Create Content | Approve Ideas | Manage Team | View All | Edit Own | Delete Own | Billing Access |
|-------------|----------|----------------|---------------|-------------|----------|----------|------------|----------------|
| CREATIVE    | VIEWER   | ✅             | ❌            | ❌          | ✅       | ✅       | ✅         | ❌            |
| CREATIVE    | MEMBER   | ✅             | ❌            | ❌          | ✅       | ✅       | ✅         | ❌            |
| CREATIVE    | MANAGER  | ✅             | ❌            | ❌          | ✅       | ✅       | ✅         | ❌            |
| CLIENT      | VIEWER   | ❌             | ✅            | ❌          | ✅       | ❌       | ❌         | ❌            |
| CLIENT      | MEMBER   | ❌             | ✅            | ❌          | ✅       | ❌       | ❌         | ❌            |
| ADMIN       | MEMBER   | ✅             | ✅            | ❌          | ✅       | ✅       | ✅         | ❌            |
| ADMIN       | MANAGER  | ✅             | ✅            | ❌          | ✅       | ✅       | ✅         | ❌            |
| ADMIN       | ADMIN    | ✅             | ✅            | ✅          | ✅       | ✅       | ✅         | ❌            |
| ADMIN       | OWNER    | ✅             | ✅            | ✅          | ✅       | ✅       | ✅         | ✅            |

---

## 🔒 Security Considerations

1. **Role Validation**: All role changes are validated against the hierarchy
2. **Owner Protection**: Organization owners cannot be removed or demoted by others
3. **Self-Protection**: Users cannot remove themselves from organizations
4. **Multi-Tenant Isolation**: All permissions are scoped to the user's organization
5. **Audit Logging**: All role changes and permission checks are logged

---

## 🎯 Best Practices

1. **Principle of Least Privilege**: Start with minimal permissions and add as needed
2. **Role Separation**: Use different roles for different responsibilities
3. **Regular Reviews**: Periodically review user roles and permissions
4. **Clear Documentation**: Document role responsibilities and permissions
5. **Testing**: Test permission boundaries regularly

---

## 🔄 Future Enhancements

1. **Custom Permissions**: Allow granular permission assignment
2. **Role Templates**: Predefined role templates for common use cases
3. **Temporary Permissions**: Time-limited elevated permissions
4. **Permission Groups**: Group permissions for easier management
5. **Advanced Auditing**: Detailed audit trails for all permission changes 