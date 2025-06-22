# 🚀 Railway Database Setup - Visual Guide

## 📋 What You Need to Do (Step by Step)

### Step 1: Access Railway Dashboard
1. **Open your browser** and go to: https://railway.app/
2. **Sign in** to your Railway account
3. **Find your project**: `savionray-content-lab-production`

### Step 2: Navigate to Your App Service
1. **Click on your app service** (not the database service)
2. **You should see** your app name and deployment status

### Step 3: Go to Deployments
1. **Click on "Deployments"** tab at the top
2. **Find the latest deployment** (should be the most recent one)
3. **Click on the deployment** to open it

### Step 4: Access Deployment Logs
1. **Click "View Logs"** button
2. **Look for a section** that says "Custom Commands" or "Run Command"
3. **Click "Add Command"** or similar button

### Step 5: Run Database Migrations
1. **In the command input field**, type:
   ```bash
   npx prisma migrate deploy
   ```
2. **Click "Run"** or "Execute"
3. **Wait for it to complete** (should take 30-60 seconds)
4. **Look for success message** like "✓ Migrations applied"

### Step 6: Seed the Database
1. **After migrations complete**, add another command:
   ```bash
   npx prisma db seed
   ```
2. **Click "Run"** or "Execute"
3. **Wait for it to complete** (should take 10-30 seconds)
4. **Look for success message** like "✓ Database seeded"

### Step 7: Test the Application
1. **Go to**: https://savionray-content-lab-production.up.railway.app/
2. **Try logging in** with:
   - Email: `creative@savionray.com`
   - Password: `anypassword`
3. **If that works**, you're all set!

## 🔍 What to Look For

### ✅ Success Indicators:
- **Migration command**: Shows "✓ Migrations applied" or similar
- **Seed command**: Shows "✓ Database seeded" or similar
- **No error messages** in red
- **Login works** with test accounts

### ❌ Error Indicators:
- **"Command not found"** - Check if you typed the command correctly
- **"Database connection failed"** - Check DATABASE_URL in environment variables
- **"Permission denied"** - Contact Railway support
- **"Timeout"** - Try running the command again

## 🚨 If You Can't Find the Custom Commands Section

### Alternative Method 1: Railway CLI
If you have Railway CLI installed:
```bash
# Install Railway CLI (if you don't have it)
npm install -g @railway/cli

# Login to Railway
railway login

# Link to your project
railway link

# Run the commands
railway run npx prisma migrate deploy
railway run npx prisma db seed
```

### Alternative Method 2: Manual User Creation
If you can't run the commands, try this:
1. **Go to the app**: https://savionray-content-lab-production.up.railway.app/
2. **Click "Sign In"**
3. **Enter any email** (e.g., `test@savionray.com`)
4. **Enter any password**
5. **Click "Sign In"**
6. **The system will create a new user** automatically

## 📞 Need Help?

### If You Get Stuck:
1. **Take a screenshot** of the Railway dashboard
2. **Note any error messages** you see
3. **Tell me exactly** where you're stuck in the process

### Common Issues:
- **Can't find "Custom Commands"** - Look for "Shell" or "Terminal" options
- **Commands fail** - Check if DATABASE_URL is set correctly
- **Login still doesn't work** - Try the manual user creation method

## 🎯 Quick Test

After running the commands, test this:
1. **Visit the app**
2. **Try logging in** with any email
3. **Create a new content idea**
4. **Try generating content**

If all of these work, your team can start testing immediately!

---

**Remember**: The key is running those two commands (`npx prisma migrate deploy` and `npx prisma db seed`) in Railway. Once those complete successfully, the login should work. 