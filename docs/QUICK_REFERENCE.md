# Quick Reference Guide - Unified Content System

## 🚨 **CRITICAL: Always Use System 2 (Unified)**

When implementing new features or fixing bugs, **NEVER** use legacy System 1 naming conventions.

## ✅ **CORRECT Status Values (Use These)**

```typescript
enum ContentItemStatus {
  IDEA              // ✅ Use this for initial ideas
  CONTENT_REVIEW    // ✅ Use this for content being worked on
  APPROVED          // ✅ Use this for approved content
  REJECTED          // ✅ Use this for rejected content
  PUBLISHED         // ✅ Use this for live content
}
```

## ❌ **WRONG Status Values (Never Use These)**

```typescript
// ❌ LEGACY - Don't use these anymore
enum DraftStatus {
  DRAFT             // ❌ Use CONTENT_REVIEW instead
  AWAITING_FEEDBACK // ❌ Use CONTENT_REVIEW instead
  AWAITING_REVISION // ❌ Use CONTENT_REVIEW instead
  APPROVED          // ❌ Use ContentItemStatus.APPROVED instead
  REJECTED          // ❌ Use ContentItemStatus.REJECTED instead
  PUBLISHED         // ❌ Use ContentItemStatus.PUBLISHED instead
}

enum IdeaStatus {
  PENDING           // ❌ Use IDEA instead
  APPROVED          // ❌ Use ContentItemStatus.APPROVED instead
  REJECTED          // ❌ Use ContentItemStatus.REJECTED instead
}
```

## 🔧 **Common Patterns**

### **1. Status Updates**
```typescript
// ✅ CORRECT
await prisma.contentItem.update({
  where: { id: contentId },
  data: { status: 'CONTENT_REVIEW' }
})

// ❌ WRONG
await prisma.contentItem.update({
  where: { id: contentId },
  data: { status: 'DRAFT' } // This will cause Prisma errors!
})
```

### **2. Status Checks**
```typescript
// ✅ CORRECT
if (content.status === 'CONTENT_REVIEW') {
  // Handle content review logic
}

// ❌ WRONG
if (content.status === 'DRAFT') {
  // This will never match!
}
```

### **3. Status Filtering**
```typescript
// ✅ CORRECT
const contentInReview = await prisma.contentItem.findMany({
  where: { status: 'CONTENT_REVIEW' }
})

// ❌ WRONG
const contentInReview = await prisma.contentItem.findMany({
  where: { status: 'DRAFT' } // This will return empty results!
})
```

## 📊 **Data Model Mapping**

### **Old → New**
| Old Model | New Model | Notes |
|-----------|-----------|-------|
| `Idea` | `ContentItem` | Use `status: 'IDEA'` |
| `ContentDraft` | `ContentItem` | Use `status: 'CONTENT_REVIEW'` |
| `IdeaStatus.PENDING` | `ContentItemStatus.IDEA` | Initial stage |
| `DraftStatus.DRAFT` | `ContentItemStatus.CONTENT_REVIEW` | Working stage |
| `DraftStatus.APPROVED` | `ContentItemStatus.APPROVED` | Approved stage |

## 🎯 **Quick Decision Tree**

### **When Creating Content:**
1. **New idea?** → Use `status: 'IDEA'`
2. **Working on content?** → Use `status: 'CONTENT_REVIEW'`
3. **Ready for approval?** → Use `status: 'APPROVED'`
4. **Needs revision?** → Use `status: 'REJECTED'`
5. **Live/published?** → Use `status: 'PUBLISHED'`

### **When Updating Status:**
1. **Moving to next stage?** → Use next `ContentItemStatus` value
2. **Returning for edits?** → Use `status: 'CONTENT_REVIEW'`
3. **Final approval?** → Use `status: 'APPROVED'`

## 🚨 **Common Errors & Fixes**

### **Error: "Invalid value for argument 'status'. Expected DraftStatus"**
**Cause**: Using old status values
**Fix**: Replace with `ContentItemStatus` values

### **Error: "Cannot find enum value 'DRAFT'"**
**Cause**: Using deprecated enum
**Fix**: Use `'CONTENT_REVIEW'` instead

### **Error: "Status 'CONTENT_REVIEW' not found in DraftStatus"**
**Cause**: Mixing old and new systems
**Fix**: Use only `ContentItemStatus` enum

## 📝 **Code Review Checklist**

Before committing, ensure:
- [ ] All status values use `ContentItemStatus` enum
- [ ] No references to `DraftStatus` or `IdeaStatus`
- [ ] Status transitions follow the unified workflow
- [ ] API responses use the correct data structure
- [ ] Frontend components expect the right status values

## 🔍 **Search & Replace Patterns**

### **Find These (Replace Them):**
```typescript
// Find
status: 'DRAFT'
// Replace with
status: 'CONTENT_REVIEW'

// Find
status: 'AWAITING_FEEDBACK'
// Replace with
status: 'CONTENT_REVIEW'

// Find
status: 'PENDING'
// Replace with
status: 'IDEA'
```

## 📞 **Need Help?**

1. **Check this guide first**
2. **Refer to full documentation**: `docs/CONTENT_MANAGEMENT_SYSTEM.md`
3. **Search codebase for examples** of correct usage
4. **Ask team** - we're all learning this together!

---

**Remember**: When in doubt, use the unified system. It's better to ask than to break production! 🚀
