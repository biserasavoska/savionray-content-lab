# 🚨 Environment Separation Guide

## Why This Matters
Mixing local, staging, and production environments can cause:
- Data corruption
- Enum mismatches
- Authentication and redirect errors
- Build and runtime failures

## Golden Rules
1. **Never use a staging/production database URL in your local `.env`.**
2. **Never copy `.env` files between environments.**
3. **Always use different secrets and URLs for each environment.**
4. **Scripts for staging/production should never be run locally, and vice versa.**

---

## 🎯 **Complete Setup Process**

### **Local Development Setup**
- `.env` should point to your local database (e.g. `localhost:5433`)
- Use `setup-env.sh` to generate a safe local `.env`
- Start your local DB: `docker-compose up -d`
- Reset local DB: `npx prisma migrate reset --force`
- Seed local DB: `npx prisma db seed`

### **Staging Environment Setup**
1. **Get your staging database URL from Railway Dashboard**
2. **Run the staging setup script:**
   ```bash
   ./scripts/setup-staging-env.sh 'postgresql://your-staging-db-url'
   ```
3. **Update Railway staging environment variables:**
   - `DATABASE_URL` = your staging database URL
   - `NEXTAUTH_URL` = your staging domain (e.g., `https://your-app-staging.railway.app`)
   - `NEXTAUTH_SECRET` = generate a new secret for staging
   - `DATABASE_PUBLIC_URL` = your staging database URL

### **Production Environment Setup**
1. **Get your production database URL from Railway Dashboard**
2. **Run the production setup script (with safety warnings):**
   ```bash
   ./scripts/setup-production-env.sh 'postgresql://your-production-db-url'
   ```
3. **Update Railway production environment variables:**
   - `DATABASE_URL` = your production database URL
   - `NEXTAUTH_URL` = your production domain
   - `NEXTAUTH_SECRET` = generate a new secret for production
   - `DATABASE_PUBLIC_URL` = your production database URL

---

## 🔍 **Verification and Troubleshooting**

### **Verify Environment Separation**
```bash
./scripts/verify-env-separation.sh
```

### **Validate Enum Consistency**
```bash
npm run validate:enums
```

### **Common Issues and Solutions**

#### **Enum Mismatch Errors**
- **Cause**: Database has old enum values that don't match current schema
- **Solution**: Reset the database using the appropriate setup script

#### **Authentication Redirect Issues**
- **Cause**: `NEXTAUTH_URL` pointing to wrong environment
- **Solution**: Update `NEXTAUTH_URL` in Railway Variables tab

#### **Database Connection Errors**
- **Cause**: Wrong database URL or credentials
- **Solution**: Check Railway Variables tab for correct `DATABASE_URL`

#### **Next.js Build Errors**
- **Cause**: Corrupted cache or missing modules
- **Solution**: 
  ```bash
  rm -rf .next
  npm install
  npm run dev
  ```

---

## 📋 **Environment Variables Checklist**

### **Local (.env)**
- ✅ `DATABASE_URL` = `postgresql://postgres:postgres@localhost:5433/savionray_content_lab`
- ✅ `NEXTAUTH_URL` = `http://localhost:3000`
- ✅ `NEXTAUTH_SECRET` = generated secret
- ❌ `DATABASE_PUBLIC_URL` = NOT SET (should be empty)

### **Staging (Railway Variables)**
- ✅ `DATABASE_URL` = staging database URL
- ✅ `NEXTAUTH_URL` = staging domain
- ✅ `NEXTAUTH_SECRET` = staging-specific secret
- ✅ `DATABASE_PUBLIC_URL` = staging database URL

### **Production (Railway Variables)**
- ✅ `DATABASE_URL` = production database URL
- ✅ `NEXTAUTH_URL` = production domain
- ✅ `NEXTAUTH_SECRET` = production-specific secret
- ✅ `DATABASE_PUBLIC_URL` = production database URL

---

## 🚀 **Quick Commands**

### **Local Development**
```bash
# Start local database
docker-compose up -d

# Reset and seed local database
npx prisma migrate reset --force

# Start development server
npm run dev
```

### **Staging Management**
```bash
# Reset staging database
./scripts/setup-staging-env.sh 'your-staging-db-url'

# Verify staging environment
./scripts/verify-env-separation.sh
```

### **Production Management**
```bash
# Reset production database (with warnings)
./scripts/setup-production-env.sh 'your-production-db-url'

# Verify production environment
./scripts/verify-env-separation.sh
```

---

## 📖 **Additional Resources**

- **Railway Dashboard**: https://railway.app/dashboard
- **Prisma Documentation**: https://www.prisma.io/docs
- **NextAuth.js Documentation**: https://next-auth.js.org

---

## 🆘 **Emergency Recovery**

If environments get mixed up:

1. **Stop all development servers**
2. **Clear Next.js cache**: `rm -rf .next`
3. **Reset local database**: `npx prisma migrate reset --force`
4. **Verify local environment**: `./scripts/verify-env-separation.sh`
5. **Reset staging/production using appropriate scripts**
6. **Update Railway environment variables**
7. **Test each environment separately**

---

**Remember**: Always verify your environment before making changes, and never run production scripts locally! 