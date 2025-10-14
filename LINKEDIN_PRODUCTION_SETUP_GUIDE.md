# 🚀 LinkedIn Integration - Production Setup Guide

## 📊 Your Railway Setup

You have **TWO separate Railway projects**:

| Project | Environment | Branch | URL |
|---------|-------------|--------|-----|
| **disciplined-presence** | Staging | `develop` | `https://savionray-content-lab-production-ffc1.up.railway.app` |
| **awake-surprise** | Production | `main` | `https://app.savionray.com` |

---

## ✅ Current Status

### Staging (disciplined-presence)
- ✅ Code deployed
- ✅ LinkedIn redirect URI configured
- ✅ Tested and working
- ✅ Ready for use

### Production (awake-surprise)
- ✅ Code deployed (just pushed to `main`)
- ❌ LinkedIn redirect URI NOT configured yet
- ⏳ Waiting for configuration
- ⏳ Not yet tested

---

## 🎯 What You Need to Do

### TASK 1: Add Production Redirect URI to LinkedIn Developer App

**This is the ONLY thing blocking production from working!**

#### Instructions:

1. **Open LinkedIn Developers**: https://www.linkedin.com/developers/apps

2. **Sign in** with your LinkedIn account

3. **Click on your app** (the one with Client ID: `77q96zpusx78du`)

4. **Click "Auth" tab** (in the left sidebar)

5. **Scroll to "OAuth 2.0 settings"**

6. **Find "Authorized redirect URLs for your app"**

7. **You should currently see TWO URLs**:
   ```
   ✅ http://localhost:3000/api/auth/linkedin/callback
   ✅ https://savionray-content-lab-production-ffc1.up.railway.app/api/auth/linkedin/callback
   ```

8. **Click "Add redirect URL"** (or the + icon)

9. **Copy and paste this EXACT URL**:
   ```
   https://app.savionray.com/api/auth/linkedin/callback
   ```

10. **Click "Update"** to save

11. **You should now see THREE URLs**:
    ```
    ✅ http://localhost:3000/api/auth/linkedin/callback
    ✅ https://savionray-content-lab-production-ffc1.up.railway.app/api/auth/linkedin/callback
    ✅ https://app.savionray.com/api/auth/linkedin/callback
    ```

12. **Done!** ✅

---

### TASK 2: Verify Railway Production Environment Variables

**I can help you check this!**

You need to verify that the **awake-surprise** project has these variables:

```bash
NEXTAUTH_URL=https://app.savionray.com
LINKEDIN_CLIENT_ID=77q96zpusx78du
LINKEDIN_CLIENT_SECRET=<your-secret>
DATABASE_URL=<production-database-url>
NEXTAUTH_SECRET=<production-secret>
OPENAI_API_KEY=<your-openai-key>
```

#### How to Check:

1. **Go to Railway**: https://railway.app
2. **Find the "awake-surprise" project**
3. **Click on your service**
4. **Go to "Variables" tab**
5. **Verify the variables above are set**

**Important**:
- ⚠️ `NEXTAUTH_URL` should be `https://app.savionray.com` (NOT the staging URL)
- ⚠️ Production should have its own `NEXTAUTH_SECRET` (different from staging)
- ⚠️ Production should use its own database (different from staging)

---

## 🧪 Testing Production

### After Completing TASK 1 & TASK 2:

1. **Wait 30 seconds** for LinkedIn's cache to update

2. **Go to production**: https://app.savionray.com/profile

3. **Log in** with your production credentials

4. **Click "Connect LinkedIn"**

5. **You should see**:
   - ✅ LinkedIn authorization dialog (not error page)
   - ✅ Permissions including "Share on LinkedIn"
   - ✅ "Allow" button

6. **Click "Allow"**

7. **You should be redirected back** to:
   ```
   https://app.savionray.com/profile?success=linkedin_connected
   ```

8. **You should see**:
   - ✅ Green "✓ Connected" badge
   - ✅ Your LinkedIn name and email
   - ✅ "Disconnect" button

---

## 🎯 Testing Publishing to LinkedIn

Once connected, test the complete flow:

1. **Create a content draft** in production
2. **Approve the content**
3. **Go to approved content list**
4. **Click "Publish to Social"** or "Publish to LinkedIn"
5. **The content should post** to your LinkedIn feed!
6. **Check your LinkedIn** to verify the post appeared

---

## 🚨 If Something Goes Wrong

### Issue: LinkedIn Shows Error Page

**Cause**: Redirect URI not added or incorrect

**Fix**:
1. Double-check the redirect URI in LinkedIn Developer App
2. Make sure it's exactly: `https://app.savionray.com/api/auth/linkedin/callback`
3. No trailing slashes
4. HTTPS (not HTTP)

### Issue: "Invalid Client" Error

**Cause**: Client ID or Secret mismatch

**Fix**:
1. Copy Client ID from LinkedIn Developer App
2. Paste into Railway `awake-surprise` project → Variables → `LINKEDIN_CLIENT_ID`
3. Repeat for Client Secret

### Issue: Connection Works But Can't Post

**Cause**: Missing `w_member_social` scope

**Fix**:
1. Disconnect LinkedIn in production
2. Reconnect (will request all scopes including posting)
3. Make sure "Share on LinkedIn" product is enabled in LinkedIn Developer App

---

## ✅ Success Checklist

- [ ] LinkedIn redirect URI added for `https://app.savionray.com/api/auth/linkedin/callback`
- [ ] Railway `awake-surprise` project has correct `NEXTAUTH_URL`
- [ ] Railway `awake-surprise` project has LinkedIn credentials
- [ ] Production deployment completed successfully
- [ ] Can connect LinkedIn on `https://app.savionray.com`
- [ ] Can publish to LinkedIn from production

---

## 📞 Need Help?

If you need help with any of these steps:
1. Share a screenshot of LinkedIn Developer App Auth tab
2. Share a screenshot of Railway Variables tab (redact secrets)
3. Share any console errors you see

---

**Once you complete TASK 1 (add redirect URI to LinkedIn), production will work!** 🚀

