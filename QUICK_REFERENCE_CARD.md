# 🚨 LOCAL APP STABILITY - QUICK REFERENCE CARD

## EMERGENCY FIX (When App Breaks)
```bash
# Run this immediately:
./emergency-fix.sh

# Or manually:
pkill -f "next dev"
rm -rf .next
npm run dev
```

## DAILY STARTUP
```bash
# Start development day:
./daily-startup.sh

# Or manually:
npm run dev:start
```

## CHECK FOR PROBLEMS
```bash
# Find page reload anti-patterns:
grep -r "window.location.reload" src/
grep -r "location.reload" src/
```

## ❌ NEVER DO THESE
```typescript
window.location.reload()        // Breaks app state
location.reload()              // Breaks app state  
window.location.href = path    // Use router.push()
```

## ✅ ALWAYS DO THESE
```typescript
// Error handling:
setError(null)
setLoading(true)
await fetchData()

// Status updates:
await updateStatus(id, status)
await fetchData()  // Refresh data

// Navigation:
router.push('/path')
```

## RED FLAGS 🚩
- "Fast Refresh had to perform a full reload"
- "Cannot find module" vendor chunk errors
- Authentication keeps resetting
- Organization context gets lost
- Multiple compilation errors

## SUCCESS SIGNS ✅
- No console errors about vendor chunks
- Authentication persists across operations
- Organization context maintained
- Error states show proper retry buttons
- Status updates work without page reloads

## PACKAGE.JSON SCRIPTS
```bash
npm run dev:emergency    # Emergency fix
npm run dev:start        # Daily startup
npm run dev:clean        # Clean restart
npm run dev:monitor      # Start with verification
```

---
**Remember: The root cause is almost always `window.location.reload()` destroying React state!**
