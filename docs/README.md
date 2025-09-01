# 📚 SavionRay Content Lab Documentation

## 🚨 **Critical Issues & Fixes**

### **1. Session User ID Mismatch (CRITICAL)**
- **Status**: Partially Fixed (1/25+ files)
- **Impact**: System-wide 500 errors, foreign key violations
- **Documentation**: [SESSION_USER_ID_MISMATCH_FIX.md](./SESSION_USER_ID_MISMATCH_FIX.md)
- **Utility**: [Session Validation Utility](../src/lib/utils/session-validation.ts)

### **2. Local Development Webpack Corruption (RESOLVED)**
- **Status**: ✅ Fixed
- **Impact**: Local app instability, development workflow disruption
- **Solution**: Aggressive webpack configuration in `next.config.js`

## 📁 **Documentation Structure**

```
docs/
├── README.md                           # This file
├── SESSION_USER_ID_MISMATCH_FIX.md    # Critical session ID issue
└── [future documentation files]
```

## 🔧 **Quick Fixes for Developers**

### **Session User ID Mismatch**
When creating new API routes, **ALWAYS** use the session validation utility:

```typescript
import { validateSessionUser } from '@/lib/utils/session-validation'

export async function POST(request: NextRequest) {
  const validation = await validateSessionUser()
  
  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error },
      { status: validation.status || 401 }
    )
  }
  
  // Use validation.realUserId for all database operations
  const realUserId = validation.realUserId
  
  // ✅ CORRECT: Use real user ID
  const result = await prisma.someTable.create({
    data: { userId: realUserId }
  })
  
  // ❌ WRONG: Don't use session.user.id directly
  // const result = await prisma.someTable.create({
  //   data: { userId: session.user.id }
  // })
}
```

### **For Admin Routes**
```typescript
import { validateAdminSessionUser } from '@/lib/utils/session-validation'

export async function POST(request: NextRequest) {
  const validation = await validateAdminSessionUser()
  
  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error },
      { status: validation.status || 401 }
    )
  }
  
  const realUserId = validation.realUserId
  // ... rest of admin logic
}
```

## 🚀 **Next Steps**

### **Immediate (This Week)**
1. Fix critical database operation routes
2. Test organization creation thoroughly
3. Deploy fixes to production

### **Short Term (Next 2 Weeks)**
1. Fix all identified API routes
2. Implement comprehensive testing
3. Update team training materials

### **Long Term (Next Month)**
1. Implement automated testing for session validation
2. Add monitoring for foreign key violations
3. Create development guidelines

## 📞 **Support**

- **Critical Issues**: Create urgent tickets
- **Questions**: Reference documentation first
- **New Patterns**: Update this documentation

---

**Last Updated**: September 1, 2025  
**Maintainer**: Development Team  
**Priority**: CRITICAL - System stability at risk
