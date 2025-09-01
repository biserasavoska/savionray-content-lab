# 🚨 Session User ID Mismatch Fix Documentation

## 📋 **Overview**

This document describes a critical issue discovered in the SavionRay Content Lab application where **session user IDs** and **database user IDs** can become mismatched, causing foreign key constraint violations and 500 errors.

## 🎯 **Problem Description**

### **Root Cause**
The application uses NextAuth.js sessions that contain user IDs that may not match the actual user IDs stored in the database. This mismatch occurs when:

1. **Session tokens are regenerated** but contain old user IDs
2. **Database user records are updated** but sessions aren't refreshed
3. **Authentication flow inconsistencies** between session and database

### **Symptoms**
- **500 Internal Server Error** responses
- **Foreign key constraint violations** in database operations
- **Transaction rollbacks** during organization/user creation
- **Inconsistent user data** across the application

### **Error Examples**
```
Foreign key constraint violated on the constraint: OrganizationUser_userId_fkey
Foreign key constraint violated on the constraint: OrganizationUser_invitedBy_fkey
```

## 🔍 **Technical Details**

### **Session vs Database ID Mismatch**
```typescript
// ❌ PROBLEMATIC: Session contains one ID
session.user.id = 'cmeluak7w0002qr6hsoy3zsza'

// ✅ CORRECT: Database contains different ID  
databaseUser.id = 'cmel76whl0002o96h1wlxj4j0'

// ❌ RESULT: Foreign key violations when using session ID
```

### **Affected Operations**
- Organization creation
- User relationship creation
- Content creation with user references
- Billing operations
- Authentication flows

## 🛠️ **Solution Pattern**

### **1. Session Validation Function**
```typescript
// ✅ CORRECT PATTERN: Always validate session user exists in database
const sessionUserInDb = await prisma.user.findUnique({
  where: { email: session.user.email },
  select: { id: true, email: true, role: true }
})

if (!sessionUserInDb) {
  return NextResponse.json(
    { error: 'Session user not found in database' },
    { status: 401 }
  )
}

// Use the REAL user ID from database, not the session ID
const realUserId = sessionUserInDb.id
```

### **2. Updated API Route Pattern**
```typescript
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // ✅ CRITICAL: Verify session user exists in database
    const sessionUserInDb = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, role: true }
    })
    
    if (!sessionUserInDb) {
      return NextResponse.json(
        { error: 'Session user not found in database' },
        { status: 401 }
      )
    }
    
    // ✅ Use REAL user ID for all database operations
    const realUserId = sessionUserInDb.id
    
    // Now use realUserId instead of session.user.id
    const result = await prisma.someTable.create({
      data: {
        userId: realUserId,        // ✅ Correct
        invitedBy: realUserId,     // ✅ Correct
        createdBy: realUserId      // ✅ Correct
      }
    })
    
    return NextResponse.json({ success: true, data: result })
    
  } catch (error) {
    logger.error('Error in API route', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

## 📁 **Files That Need Fixing**

### **🚨 CRITICAL (Database Operations)**
- `src/app/api/admin/organizations/route.ts` ✅ **FIXED**
- `src/app/api/organization/create/route.ts` ❌ **NEEDS FIX**
- `src/app/api/organization/invite/route.ts` ❌ **NEEDS FIX**
- `src/app/api/content-items/route.ts` ❌ **NEEDS FIX**
- `src/app/api/drafts/route.ts` ❌ **NEEDS FIX**

### **⚠️ MEDIUM (User References)**
- `src/app/api/billing/subscription/route.ts` ❌ **NEEDS FIX**
- `src/app/api/billing/usage/route.ts` ❌ **NEEDS FIX**
- `src/app/api/upload/route.ts` ❌ **NEEDS FIX**
- `src/app/api/feedback/route.ts` ❌ **NEEDS FIX**

### **ℹ️ LOW (Logging/Display Only)**
- `src/app/api/admin/organizations/[id]/users/[userId]/activate/route.ts`
- `src/app/api/admin/organizations/[id]/users/[userId]/deactivate/route.ts`
- `src/app/api/admin/organizations/[id]/users/route.ts`

## 🔧 **Implementation Steps**

### **Phase 1: Critical Database Operations**
1. Fix organization creation/invite routes
2. Fix content creation routes
3. Fix billing routes

### **Phase 2: User Reference Operations**
1. Fix upload routes
2. Fix feedback routes
3. Fix draft management routes

### **Phase 3: Logging and Display**
1. Update admin operation routes
2. Update user management routes
3. Update statistics routes

## 🧪 **Testing**

### **Test Cases**
1. **Organization Creation**: Should work without foreign key violations
2. **User Invitation**: Should create proper relationships
3. **Content Creation**: Should associate with correct users
4. **Billing Operations**: Should reference correct user accounts

### **Verification**
- Check Railway logs for foreign key errors
- Verify database relationships are properly established
- Confirm user associations are correct

## 🚀 **Prevention**

### **Best Practices**
1. **Always validate session users** exist in database
2. **Use database user IDs** for all foreign key relationships
3. **Implement consistent error handling** for session validation
4. **Add logging** for session vs database ID mismatches

### **Code Review Checklist**
- [ ] Session user validation implemented
- [ ] Real user ID used for database operations
- [ ] No direct `session.user.id` usage in database calls
- [ ] Proper error handling for invalid sessions

## 📚 **References**

- **Issue Date**: September 1, 2025
- **Root Cause**: Session vs Database User ID Mismatch
- **Solution**: Comprehensive session validation and real user ID usage
- **Files Fixed**: 1 (admin/organizations/route.ts)
- **Files Remaining**: 25+ identified

## 🔄 **Maintenance**

### **Regular Checks**
- Monitor Railway logs for foreign key violations
- Review new API routes for session ID usage
- Update this documentation as new patterns emerge

### **Team Training**
- Ensure all developers understand this pattern
- Include in code review guidelines
- Add to onboarding documentation

---

**Last Updated**: September 1, 2025  
**Status**: In Progress (1/25+ files fixed)  
**Priority**: CRITICAL - System-wide issue affecting core functionality
