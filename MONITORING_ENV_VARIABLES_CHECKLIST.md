# 🔍 Monitoring Environment Variables Checklist

## 📋 **Complete Environment Variables Checklist for All Monitoring Tools**

This checklist ensures all required environment variables are properly configured in your staging and production environments.

---

## 🔴 **ROLLBAR - Error Tracking & Alerting**

### **Required Variables:**
```bash
# Server-side error tracking (API routes)
ROLLBAR_SERVER_ACCESS_TOKEN=04c4928a2f754ab0bdc091733c7a8e26

# Client-side error tracking (browser)
NEXT_PUBLIC_ROLLBAR_CLIENT_ACCESS_TOKEN=5edea99b9891476885963e63bbbe691c

# Optional: Application version for source maps
NEXT_PUBLIC_APP_VERSION=1.0.0

# Environment identification
NODE_ENV=production  # or staging
```

### **✅ Checklist for Each Environment:**

#### **Staging Environment:**
- [ ] `ROLLBAR_SERVER_ACCESS_TOKEN` = `04c4928a2f754ab0bdc091733c7a8e26`
- [ ] `NEXT_PUBLIC_ROLLBAR_CLIENT_ACCESS_TOKEN` = `5edea99b9891476885963e63bbbe691c`
- [ ] `NODE_ENV` = `staging`
- [ ] `NEXT_PUBLIC_APP_VERSION` = `1.0.0` (optional)

#### **Production Environment:**
- [ ] `ROLLBAR_SERVER_ACCESS_TOKEN` = `04c4928a2f754ab0bdc091733c7a8e26`
- [ ] `NEXT_PUBLIC_ROLLBAR_CLIENT_ACCESS_TOKEN` = `5edea99b9891476885963e63bbbe691c`
- [ ] `NODE_ENV` = `production`
- [ ] `NEXT_PUBLIC_APP_VERSION` = `1.0.0` (optional)

---

## 🟢 **CHECKLY - Uptime Monitoring & Synthetic Testing**

### **Required Variables:**
```bash
# Checkly CLI authentication (for deployment)
CHECKLY_ACCOUNT_ID=7ff4cdcc-25b1-48a0-83c3-233d4a86b1d9
CHECKLY_API_KEY=cu_2af377dd442447eb90a9187b4d4613b2
```

### **✅ Checklist for Each Environment:**

#### **Staging Environment:**
- [ ] `CHECKLY_ACCOUNT_ID` = `7ff4cdcc-25b1-48a0-83c3-233d4a86b1d9`
- [ ] `CHECKLY_API_KEY` = `cu_2af377dd442447eb90a9187b4d4613b2`

#### **Production Environment:**
- [ ] `CHECKLY_ACCOUNT_ID` = `7ff4cdcc-25b1-48a0-83c3-233d4a86b1d9`
- [ ] `CHECKLY_API_KEY` = `cu_2af377dd442447eb90a9187b4d4613b2`

**Note:** Checkly is already deployed and monitoring. These variables are mainly for CLI operations.

---

## 🔵 **BETTER STACK - Log Management & Observability**

### **Required Variables:**
```bash
# Better Stack HTTP API integration
BETTERSTACK_SOURCE_TOKEN=KFgJg3R6QBRYaMtxU97zTJk7

# Optional: Customize API URL
BETTERSTACK_API_URL=https://logs.betterstack.com

# Optional: Service identification
BETTERSTACK_SERVICE_NAME=savionray-content-lab
BETTERSTACK_ENVIRONMENT=production  # or staging
```

### **✅ Checklist for Each Environment:**

#### **Staging Environment:**
- [ ] `BETTERSTACK_SOURCE_TOKEN` = `KFgJg3R6QBRYaMtxU97zTJk7`
- [ ] `BETTERSTACK_API_URL` = `https://logs.betterstack.com` (optional)
- [ ] `BETTERSTACK_SERVICE_NAME` = `savionray-content-lab` (optional)
- [ ] `BETTERSTACK_ENVIRONMENT` = `staging` (optional)

#### **Production Environment:**
- [ ] `BETTERSTACK_SOURCE_TOKEN` = `KFgJg3R6QBRYaMtxU97zTJk7`
- [ ] `BETTERSTACK_API_URL` = `https://logs.betterstack.com` (optional)
- [ ] `BETTERSTACK_SERVICE_NAME` = `savionray-content-lab` (optional)
- [ ] `BETTERSTACK_ENVIRONMENT` = `production` (optional)

---

## 🚀 **Complete Environment Variables Summary**

### **All Required Variables for Staging & Production:**

```bash
# ===== ROLLBAR =====
ROLLBAR_SERVER_ACCESS_TOKEN=04c4928a2f754ab0bdc091733c7a8e26
NEXT_PUBLIC_ROLLBAR_CLIENT_ACCESS_TOKEN=5edea99b9891476885963e63bbbe691c
NEXT_PUBLIC_APP_VERSION=1.0.0
NODE_ENV=staging  # or production

# ===== CHECKLY =====
CHECKLY_ACCOUNT_ID=7ff4cdcc-25b1-48a0-83c3-233d4a86b1d9
CHECKLY_API_KEY=cu_2af377dd442447eb90a9187b4d4613b2

# ===== BETTER STACK =====
BETTERSTACK_SOURCE_TOKEN=KFgJg3R6QBRYaMtxU97zTJk7
BETTERSTACK_API_URL=https://logs.betterstack.com
BETTERSTACK_SERVICE_NAME=savionray-content-lab
BETTERSTACK_ENVIRONMENT=staging  # or production
```

---

## 📋 **Deployment Platform Instructions**

### **Railway Deployment:**

1. **Go to Railway Dashboard**
2. **Select your service**
3. **Navigate to "Variables" tab**
4. **Add all variables listed above**
5. **Set NODE_ENV appropriately** (staging vs production)

### **Vercel Deployment:**

1. **Go to Vercel Dashboard**
2. **Select your project**
3. **Navigate to "Settings" → "Environment Variables"**
4. **Add all variables for each environment**
5. **Set NODE_ENV appropriately** (staging vs production)

---

## ✅ **Verification Steps**

### **After Setting Variables:**

1. **Deploy to staging/production**
2. **Test Rollbar**: Visit `/test-rollbar` and check for errors in Rollbar dashboard
3. **Test Checkly**: Check Checkly dashboard for active monitoring
4. **Test Better Stack**: Visit `/test-betterstack` and check logs in Better Stack dashboard

### **Expected Results:**

- **Rollbar**: Should show test errors in dashboard
- **Checkly**: Should show active monitoring checks
- **Better Stack**: Should show test logs in dashboard

---

## 🚨 **Critical Variables (Must Have):**

### **Essential for All Environments:**
- `ROLLBAR_SERVER_ACCESS_TOKEN`
- `NEXT_PUBLIC_ROLLBAR_CLIENT_ACCESS_TOKEN`
- `BETTERSTACK_SOURCE_TOKEN`
- `NODE_ENV` (staging/production)

### **Important for CLI Operations:**
- `CHECKLY_ACCOUNT_ID`
- `CHECKLY_API_KEY`

---

## 🎯 **Quick Setup Commands**

### **For Railway:**
```bash
# Add all variables to Railway
railway variables set ROLLBAR_SERVER_ACCESS_TOKEN=04c4928a2f754ab0bdc091733c7a8e26
railway variables set NEXT_PUBLIC_ROLLBAR_CLIENT_ACCESS_TOKEN=5edea99b9891476885963e63bbbe691c
railway variables set BETTERSTACK_SOURCE_TOKEN=KFgJg3R6QBRYaMtxU97zTJk7
railway variables set NODE_ENV=production
```

### **For Vercel:**
```bash
# Add all variables to Vercel
vercel env add ROLLBAR_SERVER_ACCESS_TOKEN
vercel env add NEXT_PUBLIC_ROLLBAR_CLIENT_ACCESS_TOKEN
vercel env add BETTERSTACK_SOURCE_TOKEN
vercel env add NODE_ENV
```

---

## 📊 **Status Summary**

| **Tool** | **Staging** | **Production** | **Status** |
|----------|-------------|----------------|------------|
| **Rollbar** | ⏳ Needs Setup | ⏳ Needs Setup | Ready to Deploy |
| **Checkly** | ✅ Deployed | ✅ Deployed | ✅ Active |
| **Better Stack** | ⏳ Needs Setup | ⏳ Needs Setup | Ready to Deploy |

**Next Step**: Add the required environment variables to your staging and production environments! 🚀


