# 🔧 Railway Environment Variables Update Guide

## 🚨 Current Issues to Fix

Based on the error logs, these environment variables need to be updated in Railway:

### 1. NEXTAUTH_SECRET (Critical)
**Issue**: JWT decryption errors due to missing or incorrect secret

**Solution**:
1. Go to your Railway project: https://railway.app/project/[your-project-id]
2. Click on your app service
3. Go to "Variables" tab
4. Find `NEXTAUTH_SECRET`
5. **Generate a new secure secret**:
   ```bash
   # Run this command locally to generate a new secret
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
6. **Update the value** with the generated secret
7. **Save the changes**

### 2. NEXTAUTH_URL (Important)
**Issue**: Authentication redirect issues

**Solution**:
1. In the same Variables tab
2. Set `NEXTAUTH_URL` to:
   ```
   https://savionray-content-lab-production.up.railway.app
   ```

### 3. OPENAI_API_KEY (Verify)
**Issue**: Content generation failures

**Solution**:
1. Verify `OPENAI_API_KEY` is set correctly
2. Ensure it starts with `sk-` and is valid
3. Check OpenAI dashboard for API key status

## 🔄 After Updating Variables

1. **Railway will automatically redeploy** your application
2. **Wait for deployment** to complete (usually 2-3 minutes)
3. **Check deployment logs** for any errors
4. **Test the application** at: https://savionray-content-lab-production.up.railway.app

## ✅ Verification Steps

After the redeployment, test these features:

1. **Login** with test accounts:
   - `creative@savionray.com`
   - `client@savionray.com`
   - `admin@savionray.com`

2. **Content Generation**:
   - Create a new content idea
   - Generate text content
   - Generate visual drafts

3. **Approval Workflow**:
   - Submit content for approval
   - Review and approve content

## 🚀 Team Testing Ready

Once these variables are updated, your team can start testing using the [TEAM_TESTING_GUIDE.md](./TEAM_TESTING_GUIDE.md).

## 📞 Need Help?

If you encounter issues:
1. Check Railway deployment logs
2. Verify all environment variables are set correctly
3. Test locally first to isolate issues
4. Contact the development team for support

---

**Estimated Time**: 5-10 minutes to update variables
**Deployment Time**: 2-3 minutes after saving
**Testing Time**: 15-30 minutes to verify all features 