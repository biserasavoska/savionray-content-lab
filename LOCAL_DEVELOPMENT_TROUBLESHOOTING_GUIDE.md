# Local Development Troubleshooting Guide

## Overview

This guide addresses common issues that occur during local development of the SavionRay Content Lab application. These issues are **normal** for Next.js development environments and can be resolved with the procedures outlined below.

## Common Issues & Solutions

### 1. Vendor Chunk Module Errors

**Symptoms:**
- `Cannot find module './vendor-chunks/next-auth.js'`
- `Cannot find module './vendor-chunks/jose.js'`
- `Cannot find module './vendor-chunks/clsx.js'`
- `Cannot find module './1638.js'`
- Multiple 404 errors in browser console

**Cause:**
- Corrupted build artifacts in `.next/` directory
- Fragmented vendor chunks due to rapid development changes
- Multiple dev servers running simultaneously

**Solution:**
```bash
# Stop all Next.js processes
pkill -f "next dev"

# Clean build artifacts
rm -rf .next
rm -rf node_modules/.cache

# Restart development server
npm run dev
```

### 2. Port Conflicts

**Symptoms:**
- `Port 3000 is in use, trying 3001 instead`
- App running on unexpected ports (3001, 3002, etc.)
- 404 errors when accessing localhost:3000

**Cause:**
- Multiple development servers running
- Other applications using port 3000
- Zombie processes from previous sessions

**Solution:**
```bash
# Kill all processes on port 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "No processes on port 3000"

# Kill all Next.js processes
pkill -f "next dev"

# Wait for processes to terminate
sleep 2

# Restart development server
npm run dev
```

### 3. Authentication Issues

**Symptoms:**
- "Invalid email or password" errors
- Users not found in database
- Authentication failures after database changes

**Cause:**
- Database not seeded with test users
- Database schema changes without migration
- Corrupted database state

**Solution:**
```bash
# Reset and reseed database
npx prisma migrate reset --force
npx prisma db seed

# Verify test users exist
npx prisma studio --port 5555
```

### 4. Hot Module Replacement Issues

**Symptoms:**
- "Fast Refresh had to perform a full reload"
- UI not updating after code changes
- Stale component state

**Cause:**
- Complex component dependencies
- Circular imports
- Large component trees

**Solution:**
```bash
# Force full reload
rm -rf .next
npm run dev

# Or manually refresh browser with Cmd+Shift+R (Mac) / Ctrl+Shift+R (Windows)
```

## Complete Reset Procedure

When experiencing multiple issues or before important testing sessions:

### Step 1: Stop All Processes
```bash
# Kill all Next.js processes
pkill -f "next dev"

# Kill processes on common ports
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:3001 | xargs kill -9 2>/dev/null
lsof -ti:3002 | xargs kill -9 2>/dev/null

# Wait for processes to terminate
sleep 3
```

### Step 2: Clean Build Artifacts
```bash
# Remove Next.js build cache
rm -rf .next

# Remove node modules cache
rm -rf node_modules/.cache

# Clear npm cache (optional, but recommended)
npm cache clean --force
```

### Step 3: Reset Database (if needed)
```bash
# Reset database to clean state
npx prisma migrate reset --force

# Seed with test data
npx prisma db seed

# Verify database state
npx prisma studio --port 5555
```

### Step 4: Restart Development Server
```bash
# Start development server
npm run dev

# Verify it's running on expected port
curl -I http://localhost:3000
```

## Pre-Testing Checklist

Before conducting any testing session, run through this checklist:

### ✅ Environment Setup
- [ ] All development processes stopped
- [ ] Build artifacts cleaned (`.next/` removed)
- [ ] Development server started on port 3000
- [ ] Database seeded with test users

### ✅ Authentication Verification
- [ ] Can access login page at `http://localhost:3000`
- [ ] Test users available in database
- [ ] Can successfully log in with test credentials

### ✅ Core Functionality
- [ ] Navigation loads without errors
- [ ] Organization context working
- [ ] API routes responding correctly
- [ ] No console errors in browser

## Test User Credentials

After database seeding, these test users should be available:

### Admin User
- **Email:** `admin@savionray.com`
- **Password:** `admin123`
- **Role:** Super Admin
- **Organizations:** Multiple organizations access

### Client User
- **Email:** `sara.zambelli@efaa.com`
- **Password:** `client123`
- **Role:** Client
- **Organizations:** EFAA organization

## Troubleshooting Commands Reference

### Process Management
```bash
# List all Node.js processes
ps aux | grep node

# Kill specific process by PID
kill -9 <PID>

# Kill all Next.js processes
pkill -f "next dev"
```

### Port Management
```bash
# Check what's using port 3000
lsof -i :3000

# Kill process on specific port
lsof -ti:3000 | xargs kill -9
```

### Database Management
```bash
# Reset database
npx prisma migrate reset --force

# Seed database
npx prisma db seed

# Open Prisma Studio
npx prisma studio --port 5555

# Generate Prisma client
npx prisma generate
```

### Build Management
```bash
# Clean build artifacts
rm -rf .next
rm -rf node_modules/.cache

# Reinstall dependencies (if needed)
rm -rf node_modules package-lock.json
npm install
```

## When to Use Each Solution

### Use Complete Reset When:
- Multiple issues occurring simultaneously
- Before important testing sessions
- After major code changes
- When authentication is completely broken

### Use Quick Clean When:
- Only vendor chunk errors
- Port conflicts
- Hot reload issues
- Minor UI glitches

### Use Database Reset When:
- Authentication failures
- Missing test users
- Schema-related errors
- Data corruption issues

## Prevention Tips

### 1. Regular Maintenance
- Clean build artifacts weekly
- Restart dev server daily
- Monitor for zombie processes

### 2. Development Workflow
- Use one dev server at a time
- Close unused browser tabs
- Clear browser cache regularly

### 3. Database Management
- Keep test data consistent
- Document schema changes
- Regular database backups

## Emergency Procedures

### If Nothing Works:
1. **Complete system restart:**
   ```bash
   # Stop everything
   pkill -f "next"
   pkill -f "node"
   
   # Clean everything
   rm -rf .next node_modules package-lock.json
   
   # Fresh install
   npm install
   npx prisma generate
   npx prisma migrate reset --force
   npx prisma db seed
   
   # Start fresh
   npm run dev
   ```

2. **Check system resources:**
   - Available disk space
   - Memory usage
   - CPU usage

3. **Verify environment:**
   - Node.js version compatibility
   - npm version
   - Operating system updates

## Support Contacts

If issues persist after following this guide:
1. Check the project's issue tracker
2. Review recent commits for breaking changes
3. Consult the development team
4. Document the specific error messages and steps taken

---

**Remember:** These issues are normal in Next.js development environments. The key is having a systematic approach to resolving them quickly and efficiently. 