# Documentation - SavionRay Content Lab

## 📚 **Documentation Overview**

This directory contains comprehensive documentation for the SavionRay Content Lab application, with a focus on the **unified content management system**.

## 🎯 **Current System Status**

**✅ ACTIVE**: System 2 (Unified Content Management)  
**❌ DEPRECATED**: System 1 (Legacy Dual-System)

## 📖 **Essential Documents**

### **1. [Content Management System](./CONTENT_MANAGEMENT_SYSTEM.md)**
- **Complete system architecture**
- **Data models and enums**
- **Workflow stages and transitions**
- **Implementation guidelines**
- **Migration checklist**

### **2. [Quick Reference Guide](./QUICK_REFERENCE.md)**
- **Critical status values to use**
- **Common patterns and examples**
- **Error fixes and troubleshooting**
- **Code review checklist**

## 🚨 **Critical Information**

### **ALWAYS Use These Status Values:**
```typescript
enum ContentItemStatus {
  IDEA              // Initial content idea
  CONTENT_REVIEW    // Content being worked on
  APPROVED          // Approved content
  REJECTED          // Rejected content
  PUBLISHED         // Live content
}
```

### **NEVER Use These (Legacy):**
```typescript
// ❌ Don't use these anymore
enum DraftStatus {
  DRAFT             // Use CONTENT_REVIEW instead
  AWAITING_FEEDBACK // Use CONTENT_REVIEW instead
  AWAITING_REVISION // Use CONTENT_REVIEW instead
}
```

## 🔄 **Current Implementation Status**

### **✅ Completed:**
- [x] Organization creation fixed
- [x] Content review page status mapping
- [x] Unified system documentation
- [x] Quick reference guide

### **🔄 In Progress:**
- [ ] Migration from legacy models
- [ ] API endpoint standardization
- [ ] Frontend component updates

### **📋 Planned:**
- [ ] Complete schema migration
- [ ] End-to-end testing
- [ ] Performance optimization

## 🛠️ **Development Workflow**

### **Before Making Changes:**
1. **Read the Quick Reference Guide** - understand current conventions
2. **Check the full system documentation** - understand the architecture
3. **Use only unified system values** - never mix old and new

### **When Implementing Features:**
1. **Follow the unified workflow** - IDEA → CONTENT_REVIEW → APPROVED → PUBLISHED
2. **Use ContentItemStatus enum** - never hardcode status strings
3. **Test status transitions** - ensure they follow the defined flow

### **Code Review Checklist:**
- [ ] All status values use `ContentItemStatus` enum
- [ ] No references to deprecated enums
- [ ] Status transitions follow unified workflow
- [ ] API responses use correct data structure

## 🚨 **Common Issues & Solutions**

### **Issue: "Invalid value for argument 'status'. Expected DraftStatus"**
**Solution**: Replace with `ContentItemStatus` values

### **Issue: Status not updating correctly**
**Solution**: Check that you're using the unified status values

### **Issue: Content not appearing in expected lists**
**Solution**: Verify status filtering uses correct enum values

## 📞 **Getting Help**

### **1. Check Documentation First:**
- Start with the [Quick Reference Guide](./QUICK_REFERENCE.md)
- Refer to [full system documentation](./CONTENT_MANAGEMENT_SYSTEM.md)

### **2. Search Codebase:**
- Look for examples of correct usage
- Check existing implementations

### **3. Ask the Team:**
- We're all learning the unified system together
- Better to ask than to break production

## 🔗 **Related Resources**

### **Code Examples:**
- [Content Creation Examples](./examples/content-creation.md)
- [Status Transition Examples](./examples/status-transitions.md)
- [API Integration Examples](./examples/api-integration.md)

### **Technical Documentation:**
- [API Reference](./API_REFERENCE.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [Frontend Components](./FRONTEND_COMPONENTS.md)

## 📝 **Documentation Updates**

### **When to Update:**
- New features implemented
- Status values changed
- Workflow modifications
- Bug fixes applied

### **How to Update:**
1. Update relevant documentation files
2. Update version history
3. Notify team of changes
4. Update quick reference if needed

---

## 🎯 **Key Takeaway**

**Always use the unified system (System 2).** The legacy system (System 1) is deprecated and will cause errors. When in doubt, refer to the documentation or ask the team.

---

**Last Updated**: August 20, 2025  
**Maintainer**: Development Team  
**Status**: Active Documentation
