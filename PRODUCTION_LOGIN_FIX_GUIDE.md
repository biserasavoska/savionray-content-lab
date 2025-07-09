# Production Login Fix Guide

## Issue Summary
The production environment has login issues due to:
1. Missing `isSuperAdmin` column in the User table
2. Potential admin user configuration problems

## Solution

### Option 1: Run the Comprehensive Fix Script (Recommended)

1. **Set up the production database connection:**
   ```bash
   export DATABASE_URL="your-production-database-url"
   ```

2. **Run the comprehensive fix script:**
   ```bash
   node scripts/fix-production-login.js
   ```

This script will:
- ✅ Add the missing `isSuperAdmin` column to the User table
- ✅ Create or update the admin user with proper credentials
- ✅ Set the password to `admin123` (temporary)
- ✅ Verify everything is working correctly

### Option 2: Run Individual Scripts

If you prefer to run fixes separately:

1. **Fix the database schema:**
   ```bash
   node scripts/fix-production-schema.js
   ```

2. **Reset the admin user:**
   ```bash
   node scripts/reset-production-admin.js
   ```

## Login Credentials

After running the fix:
- **Email:** `admin@savionray.com`
- **Password:** `admin123`

⚠️ **Important:** Change the password immediately after successful login!

## Verification Steps

1. **Test login in production**
2. **Verify admin user can access all features**
3. **Check that other users can still log in**
4. **Change the admin password to something secure**

## Troubleshooting

### If the script fails:

1. **Check database connection:**
   ```bash
   echo $DATABASE_URL
   ```

2. **Verify database permissions:**
   - Ensure the database user has ALTER TABLE permissions
   - Check that the connection string is correct

3. **Check for existing data conflicts:**
   - The script will handle most cases automatically
   - If there are specific errors, check the error message

### If login still doesn't work:

1. **Check environment variables in production**
2. **Verify NextAuth configuration**
3. **Check application logs for specific errors**

## Rollback Plan

If something goes wrong:

1. **Database backup:** The script doesn't delete data, only adds/updates
2. **Column removal:** If needed, you can remove the `isSuperAdmin` column:
   ```sql
   ALTER TABLE "User" DROP COLUMN "isSuperAdmin";
   ```

## Security Notes

- The temporary password `admin123` should be changed immediately
- Consider enabling 2FA for admin accounts
- Review user permissions after the fix
- Monitor login attempts for any suspicious activity

## Support

If you encounter issues:
1. Check the application logs
2. Verify database connectivity
3. Test with the provided scripts
4. Contact the development team if problems persist 