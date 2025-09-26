# Quick Reference: Preventing TypeScript Deployment Cascades

## Before Creating New Utility Files

### 1. Search for Existing Imports
```bash
# Check if file already exists or is imported
grep -r "from.*filename" src/
grep -r "import.*filename" src/
```

### 2. Map Required Exports
```bash
# Find all imports from similar files
grep -r "from.*error-handling" src/
grep -r "from.*utils" src/
```

### 3. Check Function Signatures
```bash
# See how functions are being called
grep -r "functionName(" src/
```

## Implementation Checklist

- [ ] **Complete Analysis**: Search codebase for existing imports
- [ ] **Export Mapping**: List all required exports upfront
- [ ] **Signature Validation**: Check function parameters in existing usage
- [ ] **Complete Implementation**: Implement all exports in first commit
- [ ] **Local Testing**: Run `npm run build` before pushing
- [ ] **Import Verification**: Ensure all imports resolve correctly

## Common Cascade Triggers

1. **Incomplete Utility Files**: Missing exports that existing code expects
2. **Function Signature Mismatches**: Parameters don't match existing usage
3. **Type Definition Gaps**: Missing TypeScript types for existing code
4. **Import Path Changes**: Moving files without updating all imports

## Emergency Response

1. **Fix One Error at a Time**: Don't try to fix multiple issues simultaneously
2. **Test Each Fix**: Verify each fix resolves the specific error
3. **Document the Pattern**: Track which errors appear in sequence
4. **Root Cause Analysis**: Identify the trigger event causing the cascade

## Prevention Commands

```bash
# Pre-creation analysis
grep -r "from.*target-file" src/
grep -r "import.*target-file" src/

# Function usage analysis
grep -r "functionName(" src/

# Local testing
npm run build
npm run type-check

# Import verification
npm run lint
```

## Red Flags

- Creating utility files without checking existing imports
- Implementing functions without checking existing usage
- Making multiple changes in one commit
- Pushing without local testing
- Ignoring TypeScript errors in development

---

*This quick reference was created after analyzing 6 consecutive deployment failures caused by incomplete utility file implementation.*
