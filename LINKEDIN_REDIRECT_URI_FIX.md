# LinkedIn Redirect URI Mismatch Fix

## Problem Analysis

You're seeing LinkedIn OAuth errors in the browser console:
```
bd4wlgg9kzz4u85nas4duu0py:101  GET https://static.licdn.com/sc/p/com.linkedin.oauth-fe...
109a9uuj40g1xqz597iv5oz4v:3 Uncaught TypeError: Cannot read properties of null (reading 'textContent')
```

**These errors are from LinkedIn's OAuth page**, which means LinkedIn is showing you an error instead of the authorization dialog. This is almost always caused by a **redirect_uri mismatch**.

## Current State

### Local (Working ✅)
- **App URL**: `http://localhost:3000`
- **Redirect URI**: `http://localhost:3000/api/auth/linkedin/callback`
- **Status**: ✅ Works perfectly

### Railway Staging (Failing ❌)
- **App URL**: `https://savionray-content-lab-production-ffc1.up.railway.app`
- **Redirect URI**: `https://savionray-content-lab-production-ffc1.up.railway.app/api/auth/linkedin/callback`
- **Status**: ❌ LinkedIn shows error page

## Root Cause

The LinkedIn Developer App has **allowed redirect URIs** configured. When you click "Connect LinkedIn", your app sends the user to LinkedIn with a `redirect_uri` parameter. LinkedIn checks if this URI is in the allowed list. If not, it shows an error page.

## Solution Steps

### Step 1: Check Your LinkedIn Developer App Settings

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Select your app
3. Go to **Auth** tab
4. Find **OAuth 2.0 settings**
5. Look at **Authorized redirect URLs for your app**

### Step 2: Add Railway Redirect URI

You need to add **BOTH** of these redirect URIs:

```
http://localhost:3000/api/auth/linkedin/callback
https://savionray-content-lab-production-ffc1.up.railway.app/api/auth/linkedin/callback
```

**Important Notes:**
- ✅ Use **HTTPS** for Railway (not HTTP)
- ✅ Include the **full path** `/api/auth/linkedin/callback`
- ✅ Match the exact domain from your Railway deployment
- ❌ Do NOT include trailing slashes
- ❌ Do NOT use wildcards

### Step 3: Verify the Products

Make sure you have **BOTH** products enabled in your LinkedIn app:

1. **Sign In with LinkedIn using OpenID Connect**
   - Provides: `openid`, `profile`, `email` scopes
   - Required for: User authentication

2. **Share on LinkedIn**
   - Provides: `w_member_social` scope
   - Required for: Posting to LinkedIn

### Step 4: Check Environment Variables on Railway

1. Go to Railway project
2. Click on your service
3. Go to **Variables** tab
4. Verify these are set correctly:

```bash
NEXTAUTH_URL=https://savionray-content-lab-production-ffc1.up.railway.app
LINKEDIN_CLIENT_ID=<your-client-id>
LINKEDIN_CLIENT_SECRET=<your-client-secret>
```

**Important**: 
- The `NEXTAUTH_URL` must match **exactly** what's in LinkedIn's redirect URIs
- No trailing slash on `NEXTAUTH_URL`

### Step 5: Test Again

After updating the LinkedIn Developer App settings:

1. Wait ~30 seconds for LinkedIn's cache to update
2. Go to Railway app: `https://savionray-content-lab-production-ffc1.up.railway.app/profile`
3. Click "Connect LinkedIn"
4. You should now see the proper LinkedIn authorization dialog (not an error)

## Debugging

### If you still see the error:

1. **Check Railway logs** for the debug output:
   ```
   🔍 LinkedIn Connect Debug: {
     NEXTAUTH_URL: '...',
     redirectUri: '...'
   }
   ```

2. **Copy the exact `redirectUri`** from the logs

3. **Paste it** into LinkedIn Developer App's redirect URIs

4. **Make sure it matches EXACTLY** (check for trailing slashes, http vs https, etc.)

### Common Mistakes

❌ **Wrong Protocol**:
   - LinkedIn: `http://savionray-content-lab...`
   - Should be: `https://savionray-content-lab...`

❌ **Trailing Slash**:
   - LinkedIn: `https://savionray-content-lab.../api/auth/linkedin/callback/`
   - Should be: `https://savionray-content-lab.../api/auth/linkedin/callback`

❌ **Wrong Domain**:
   - LinkedIn: `https://savionray-content-lab-production.up.railway.app/...`
   - Should be: `https://savionray-content-lab-production-ffc1.up.railway.app/...`
   - (Note the `-ffc1` in the domain)

❌ **Wildcard**:
   - LinkedIn: `https://*.railway.app/api/auth/linkedin/callback`
   - Not supported! Must be exact URL

## Expected Result

After fixing the redirect URI, you should see:

1. ✅ LinkedIn authorization dialog appears
2. ✅ You can click "Allow" to authorize
3. ✅ Redirected back to your app with success message
4. ✅ Console shows: `isConnected: true`, `scope: "openid profile email w_member_social"`

## Quick Check Command

Run this to see what redirect URI your app is using:

```bash
curl -I https://savionray-content-lab-production-ffc1.up.railway.app/api/auth/linkedin/connect
```

Look for the `Location:` header - it will contain the redirect_uri that LinkedIn receives.

