# 🔑 How to Find Checkly Environment Variables

## 📍 Where to Find Your Checkly API Credentials

### 1. **Account ID** (`CHECKLY_ACCOUNT_ID`)
- Go to your **Checkly Dashboard**
- Look at the **URL** in your browser - it will be something like:
  ```
  https://app.checklyhq.com/accounts/12345/checks
  ```
- The number after `/accounts/` is your **Account ID** (e.g., `12345`)

### 2. **API Key** (`CHECKLY_API_KEY`)
- In your Checkly dashboard, go to **Settings** (usually in the top right)
- Look for **"API Keys"** or **"Integrations"** section
- Click on **"Create API Key"** or **"Generate API Key"**
- Copy the generated API key (it will look like: `ck_live_xxxxxxxxxxxxxxxxxxxxxxxx`)

## 🚀 Alternative: Quick Setup Steps

### Step 1: Get Your Account ID
1. Open your Checkly dashboard
2. Check the URL: `https://app.checklyhq.com/accounts/YOUR_ACCOUNT_ID/checks`
3. Copy the number after `/accounts/`

### Step 2: Generate API Key
1. Go to **Settings** → **API Keys**
2. Click **"Create API Key"**
3. Give it a name like "CLI Access"
4. Copy the generated key

### Step 3: Set Environment Variables
Once you have both values, run these commands in your terminal:

```bash
export CHECKLY_ACCOUNT_ID=your_account_id_here
export CHECKLY_API_KEY=your_api_key_here
```

## 🔍 Visual Guide

If you can't find these sections, look for:
- **User menu** (your profile picture/name in top right)
- **Account Settings** or **Workspace Settings**
- **API** or **Integrations** tab
- **Developer** or **CLI** section

## ✅ Test Your Setup

After setting the environment variables, test with:
```bash
npx checkly whoami
```

This should show your account information if the credentials are correct.

## 🎯 Next Steps

Once you have the environment variables set, I can immediately run:
1. `npx checkly test --record` (test your checks)
2. `npx checkly deploy` (deploy to Checkly)

Let me know when you have the Account ID and API Key, and I'll help you set them up! 🚀


