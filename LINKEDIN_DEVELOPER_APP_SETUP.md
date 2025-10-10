# 🔧 LinkedIn Developer App Configuration Guide

## 📍 Where to Find Your LinkedIn App Settings

### Step 1: Access LinkedIn Developers Portal

1. Go to: **https://www.linkedin.com/developers/apps**
2. Sign in with your LinkedIn account
3. You should see a list of your apps

### Step 2: Select Your App

Click on the app you created for this integration (the one with your `LINKEDIN_CLIENT_ID`).

---

## ⚙️ Auth Configuration (CRITICAL)

### Navigate to Auth Tab

1. In the left sidebar, click **"Auth"**
2. Scroll down to **"OAuth 2.0 settings"**
3. Find the section: **"Authorized redirect URLs for your app"**

### What You Should See

There should be a text input field where you can add redirect URLs. You might already have:
```
http://localhost:3000/api/auth/linkedin/callback
```

### What You Need to Add

Add this second URL (click "Add redirect URL" or the + button):
```
https://savionray-content-lab-production-ffc1.up.railway.app/api/auth/linkedin/callback
```

### Final State

Your "Authorized redirect URLs" should contain **BOTH**:
```
✅ http://localhost:3000/api/auth/linkedin/callback
✅ https://savionray-content-lab-production-ffc1.up.railway.app/api/auth/linkedin/callback
```

### Important Notes

- ⚠️ The URLs must match **EXACTLY** (including `http://` vs `https://`)
- ⚠️ No trailing slashes
- ⚠️ No wildcards
- ⚠️ Case-sensitive

---

## 🎁 Products Configuration (CRITICAL)

### Navigate to Products Tab

1. In the left sidebar, click **"Products"**
2. You should see a list of available LinkedIn products

### Required Products

You need **TWO** products enabled for this integration:

#### 1. Sign In with LinkedIn using OpenID Connect

**Status**: Should show **"Added"** or **"Verification Required"**

**Purpose**: Allows users to authenticate with LinkedIn

**Scopes Provided**:
- `openid` - Required for OIDC
- `profile` - User's name and profile picture
- `email` - User's email address

**If Not Added**:
1. Find "Sign In with LinkedIn using OpenID Connect" in the list
2. Click **"Request access"** or **"Add product"**
3. Fill out any required information
4. Wait for approval (usually instant)

#### 2. Share on LinkedIn

**Status**: Should show **"Added"** or **"Verification Required"**

**Purpose**: Allows posting to LinkedIn on behalf of users

**Scopes Provided**:
- `w_member_social` - Post to LinkedIn feed

**If Not Added**:
1. Find "Share on LinkedIn" in the list
2. Click **"Request access"** or **"Add product"**
3. Fill out any required information
4. Wait for approval (usually instant)

### Verification Status

Some products may require verification:
- **Development apps**: Usually no verification needed
- **Production apps**: May need to submit for review

**For testing**: You can use development mode without verification. The integration will work for accounts that are app admins/developers.

---

## 🔑 Credentials

### Navigate to Auth Tab → Application credentials

Here you'll find your:

**Client ID**: `77q96zpu...` (should match your `LINKEDIN_CLIENT_ID` env var)

**Client Secret**: `WJ8Wkfm...` (should match your `LINKEDIN_CLIENT_SECRET` env var)

### Verify These Match Railway

Your Railway environment variables should have:
```bash
LINKEDIN_CLIENT_ID=<same as LinkedIn Developer App>
LINKEDIN_CLIENT_SECRET=<same as LinkedIn Developer App>
```

---

## 📊 App Settings

### Navigate to Settings Tab

**App name**: Make sure it's something users will recognize

**Privacy policy URL**: Required for production

**App logo**: Optional but recommended

**Application status**: 
- **Development**: For testing (recommended for now)
- **Production**: For public use (requires verification)

---

## 🧪 Testing Your Configuration

### Test Checklist

After configuring everything above:

1. ✅ Both redirect URLs added to Auth tab
2. ✅ "Sign In with LinkedIn using OpenID Connect" product added
3. ✅ "Share on LinkedIn" product added
4. ✅ Client ID matches Railway env var
5. ✅ Client Secret matches Railway env var

### Test the Flow

1. **Local Test**:
   - Go to: http://localhost:3000/profile
   - Click "Connect LinkedIn"
   - Should see LinkedIn authorization dialog
   - Click "Allow"
   - Should redirect back successfully

2. **Railway Test**:
   - Go to: https://savionray-content-lab-production-ffc1.up.railway.app/profile
   - Click "Connect LinkedIn"
   - Should see LinkedIn authorization dialog
   - Click "Allow"
   - Should redirect back successfully

### What Success Looks Like

After clicking "Allow", you should see:
- ✅ Redirected back to `/profile?success=linkedin_connected`
- ✅ Green "✓ Connected" badge
- ✅ Your name and email displayed
- ✅ "Disconnect" button visible

---

## ❌ Common Issues

### Issue: "Invalid Redirect URI"

**Symptom**: LinkedIn shows error page with console errors

**Cause**: Redirect URI not in allowed list

**Fix**: Add the exact redirect URI to Auth tab

### Issue: "Invalid Client"

**Symptom**: Error during token exchange

**Cause**: Client ID or Secret mismatch

**Fix**: 
1. Copy Client ID from LinkedIn Developer App
2. Paste into Railway `LINKEDIN_CLIENT_ID`
3. Repeat for Client Secret

### Issue: "Insufficient Permissions"

**Symptom**: Can connect but can't post to LinkedIn

**Cause**: "Share on LinkedIn" product not added

**Fix**: Add "Share on LinkedIn" product in Products tab

### Issue: "Access Denied"

**Symptom**: LinkedIn rejects authorization

**Cause**: User not an admin/developer of the app

**Fix**: 
1. Go to Settings tab in LinkedIn Developer App
2. Add user as an app admin
3. Or submit app for production verification

---

## 🎯 Quick Reference

### Your Configuration Should Be:

**Auth Tab** → Authorized redirect URLs:
```
http://localhost:3000/api/auth/linkedin/callback
https://savionray-content-lab-production-ffc1.up.railway.app/api/auth/linkedin/callback
```

**Products Tab** → Products added:
```
✅ Sign In with LinkedIn using OpenID Connect
✅ Share on LinkedIn
```

**Auth Tab** → Application credentials:
```
Client ID: 77q96zpu... (matches LINKEDIN_CLIENT_ID)
Client Secret: WJ8Wkfm... (matches LINKEDIN_CLIENT_SECRET)
```

---

## 🚀 After Configuration

Once everything is configured correctly:

1. Wait 30 seconds for LinkedIn's cache to update
2. Test on Railway
3. If it works, you're done! 🎉
4. If not, check the troubleshooting section above

---

## 📞 Need More Help?

If you're still stuck after following this guide:

1. Take a screenshot of your LinkedIn Developer App **Auth tab**
2. Take a screenshot of your Railway **Variables tab**
3. Share the console errors you're seeing
4. Share the Railway deployment logs

This will help diagnose the exact issue!

