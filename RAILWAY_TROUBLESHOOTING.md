# 🔧 Railway Troubleshooting Guide

## 🚨 Common Issues & Solutions

### Issue 1: "Invalid email or password" Error

**Cause**: Database not properly initialized or seeded

**Solutions**:
1. **Run database migrations**:
   ```bash
   npx prisma migrate deploy
   ```

2. **Seed the database**:
   ```bash
   npx prisma db seed
   ```

3. **Manual user creation**: Try logging in with any email (system will create new user)

### Issue 2: Database Connection Failed

**Cause**: DATABASE_URL not set correctly

**Solution**:
1. Check Railway environment variables
2. Ensure DATABASE_URL points to Railway PostgreSQL
3. Verify PostgreSQL service is running

### Issue 3: OpenAI API Errors

**Cause**: OPENAI_API_KEY not configured

**Solution**:
1. Verify OPENAI_API_KEY is set in Railway
2. Check API key is valid and has credits
3. Ensure key starts with `sk-`

### Issue 4: NextAuth JWT Errors

**Cause**: NEXTAUTH_SECRET missing or incorrect

**Solution**:
1. Generate new NEXTAUTH_SECRET:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
2. Update in Railway environment variables

### Issue 5: Build Failures

**Cause**: Missing dependencies or build errors

**Solution**:
1. Check Railway build logs
2. Ensure all dependencies are in package.json
3. Verify Node.js version compatibility

## 🔍 Railway Logs Analysis

### How to Check Logs:
1. Go to Railway project dashboard
2. Click on your app service
3. Go to "Deployments" tab
4. Click on latest deployment
5. Click "View Logs"

### Common Log Messages:

**✅ Success Indicators**:
```
✓ Compiled successfully
✓ Ready in Xms
✓ Database connected
✓ Migrations applied
```

**❌ Error Indicators**:
```
✗ Build failed
✗ Database connection failed
✗ Environment variable missing
✗ API key invalid
```

## 🚀 Quick Fix Commands

### For Database Issues:
```bash
# In Railway custom commands
npx prisma migrate deploy
npx prisma db seed
```

### For Environment Issues:
```bash
# Check environment variables
echo $DATABASE_URL
echo $NEXTAUTH_SECRET
echo $OPENAI_API_KEY
```

### For Build Issues:
```bash
# Force rebuild
npm install
npm run build
```

## 📞 Getting Help

### 1. Check Railway Status
- Visit Railway status page
- Check if there are any service outages

### 2. Verify Environment Variables
- Ensure all required variables are set
- Check for typos in variable names
- Verify variable values are correct

### 3. Test Locally First
- Run the application locally
- Verify it works with local database
- Compare local vs Railway configuration

### 4. Contact Support
- Check Railway documentation
- Contact Railway support if needed
- Share specific error messages

## 🎯 Success Checklist

After following the troubleshooting steps, verify:

- [ ] **Application loads** without errors
- [ ] **Login works** with test accounts
- [ ] **Database operations** work (create ideas, etc.)
- [ ] **Content generation** works
- [ ] **Visual generation** works
- [ ] **All features** are accessible

## 🔄 Reset Options

If all else fails:

### Option 1: Fresh Deployment
1. Delete current Railway project
2. Create new project
3. Deploy from GitHub
4. Configure environment variables
5. Run database setup

### Option 2: Database Reset
1. Reset Railway PostgreSQL database
2. Run migrations again
3. Seed with fresh data

### Option 3: Environment Reset
1. Clear all environment variables
2. Add them back one by one
3. Test after each addition

---

**Remember**: Most issues are related to environment variables or database setup. Start with the database commands and work your way through the checklist. 