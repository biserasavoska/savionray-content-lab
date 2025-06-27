# Staging Database Setup Guide

## ✅ Current Status
- ✅ Local database is clean and working
- ✅ All enum values are correct
- ✅ Users can log in with passwords
- ✅ No more enum errors
- ✅ App is running successfully on localhost:3000

## 🚀 How to Fix Staging

### Option 1: Use Railway CLI (Recommended)

1. **Install Railway CLI** (if not already installed):
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**:
   ```bash
   railway login
   ```

3. **Link to your staging project**:
   ```bash
   railway link
   # Select your "awake-surprise" project
   ```

4. **Set the staging environment**:
   ```bash
   railway environment staging
   ```

5. **Run the setup script**:
   ```bash
   ./scripts/setup-staging-db.sh
   ```

### Option 2: Manual Setup via Railway Dashboard

1. **Go to your Railway dashboard**
2. **Navigate to the "awake-surprise" project**
3. **Select the "staging" environment**
4. **Click on your Postgres database**
5. **Go to the "Data" tab**
6. **Click "Reset Database"** (this will clear all data)
7. **Go to the "Variables" tab**
8. **Copy the `DATABASE_URL`**
9. **Run locally with the staging database**:
   ```bash
   export DATABASE_URL="your_staging_database_url_here"
   npx prisma migrate reset --force
   ```

## 🔑 Login Credentials

After setup, you can log in with any of these accounts:

| Email | Password | Role |
|-------|----------|------|
| `creative@savionray.com` | `password123` | Creative |
| `client@savionray.com` | `password123` | Client |
| `admin@savionray.com` | `password123` | Admin |
| `bisera@savionray.com` | `SavionRay2025!` | Admin |

## 🎯 What This Fixes

- ✅ **Enum errors**: All old enum values (`APPROVED_BY_CLIENT`, `PENDING_FIRST_REVIEW`, etc.) are removed
- ✅ **Database consistency**: Staging will have the same clean schema as local
- ✅ **User authentication**: All users can log in with passwords
- ✅ **No build errors**: Clean database prevents Prisma validation errors
- ✅ **Working app**: All pages and API endpoints will work correctly

## 🚨 Important Notes

1. **This will RESET your staging database** - all existing data will be lost
2. **Make sure you're in the staging environment** before running the script
3. **The script will create fresh test data** with the correct enum values
4. **After setup, deploy your app** to the staging environment

## 🔧 Troubleshooting

If you get connection errors:
- Make sure you're using the Railway CLI or have the correct external database URL
- Check that your staging database is running in Railway
- Verify you're in the correct environment (staging, not production)

## 📝 Next Steps

1. **Set up staging database** using one of the methods above
2. **Deploy your app** to the staging environment
3. **Test login** with the provided credentials
4. **Verify all features work** on staging
5. **When ready, deploy to production**

---

**Your local app is now working perfectly! 🎉** 