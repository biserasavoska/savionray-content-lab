# Better Stack Setup Guide for SavionRay Content Lab

## 🎯 Overview

Better Stack provides comprehensive log management, tracing, and infrastructure monitoring for your SavionRay Content Lab application. This setup includes HTTP API integration for log collection and metrics tracking.

## 📋 What's Been Set Up

### ✅ **Better Stack Integration Files Created:**

- **`src/lib/betterstack.ts`** - Main Better Stack client for logging and metrics
- **`src/lib/middleware/betterstack-middleware.ts`** - API request tracking middleware
- **`src/app/api/test-betterstack/route.ts`** - Test API endpoints
- **`src/app/test-betterstack/page.tsx`** - Test page for Better Stack integration

### 🚀 **Features Included:**

- **Log Collection**: Info, warning, error, and debug logging
- **Metrics Tracking**: Custom metrics and performance data
- **User Action Tracking**: Track user interactions and behaviors
- **API Request Monitoring**: Automatic tracking of API requests and responses
- **Error Tracking**: Comprehensive error logging with context

## 🔧 **Environment Setup**

### 1. **Get Your Better Stack Source Token**

1. Go to your [Better Stack Dashboard](https://logs.betterstack.com)
2. Navigate to **Sources** → **Create Source**
3. Choose **HTTP API** as the source type
4. Copy your **Source Token**

### 2. **Set Environment Variables**

Add the following to your `.env.local` file:

```bash
# Better Stack Configuration
BETTERSTACK_SOURCE_TOKEN=your_source_token_here
BETTERSTACK_API_URL=https://logs.betterstack.com

# Optional: Customize service name and environment
BETTERSTACK_SERVICE_NAME=savionray-content-lab
BETTERSTACK_ENVIRONMENT=production  # or staging, development
```

### 3. **Add to Deployment Platform**

For your staging and production deployments, add these variables to your hosting provider:

**Example for Railway:**
1. Go to your Railway project dashboard
2. Select your service
3. Navigate to the "Variables" tab
4. Add `BETTERSTACK_SOURCE_TOKEN` with your source token

**Example for Vercel:**
1. Go to your Vercel project dashboard
2. Navigate to "Settings" → "Environment Variables"
3. Add the variables for each environment

## 🧪 **Testing the Integration**

### 1. **Test API Endpoints**

Visit: `http://localhost:3001/api/test-betterstack?type=info`

Available test types:
- `info` - Test info logging
- `warning` - Test warning logging
- `error` - Test error logging
- `metric` - Test metric tracking
- `user-action` - Test user action tracking

### 2. **Test Page**

Visit: `http://localhost:3001/test-betterstack`

This page provides a UI to test all Better Stack integration features.

### 3. **Manual Testing**

```bash
# Test info logging
curl "http://localhost:3001/api/test-betterstack?type=info"

# Test error logging
curl "http://localhost:3001/api/test-betterstack?type=error"

# Test custom message
curl -X POST http://localhost:3001/api/test-betterstack \
  -H "Content-Type: application/json" \
  -d '{"message":"Custom test message","level":"info"}'
```

## 📊 **What Better Stack Will Monitor**

### **Application Logs**
- **Info logs**: General application events
- **Warning logs**: Potential issues and warnings
- **Error logs**: Application errors with full context
- **Debug logs**: Detailed debugging information

### **User Actions**
- **User interactions**: Login, logout, content creation
- **Organization activities**: Team management, settings changes
- **Content operations**: Draft creation, publishing, scheduling

### **API Performance**
- **Request tracking**: All API endpoints monitored
- **Response times**: Performance metrics for each endpoint
- **Error rates**: Track API error patterns
- **Usage patterns**: Understand API usage

### **Custom Metrics**
- **Performance metrics**: Response times, throughput
- **Business metrics**: User engagement, content metrics
- **System metrics**: Resource usage, availability

## 🎯 **Integration with Existing Monitoring**

### **Perfect Combination:**
- **Rollbar**: Catches application errors when they happen
- **Checkly**: Prevents errors by monitoring proactively
- **Better Stack**: Provides comprehensive logging and observability

### **Together They Provide:**
- **Complete error monitoring** (Rollbar)
- **Proactive uptime monitoring** (Checkly)
- **Comprehensive logging and observability** (Better Stack)

## 🚀 **Next Steps**

### 1. **Set Up Source Token**
- Get your Better Stack source token
- Add it to your environment variables
- Test the integration

### 2. **Configure Alerts**
- Set up alerts in Better Stack dashboard
- Configure notification channels
- Set up log-based alerts for critical issues

### 3. **Customize Logging**
- Add custom logging to your application
- Track specific business metrics
- Set up custom dashboards

### 4. **Production Deployment**
- Deploy with environment variables
- Monitor logs in production
- Set up alerting for critical issues

## 📱 **Better Stack Dashboard Features**

Once set up, you'll have access to:

- **Real-time log streaming**
- **Log search and filtering**
- **Custom dashboards**
- **Alert configuration**
- **Performance metrics**
- **User action tracking**

## 🎉 **Ready to Deploy!**

Your Better Stack integration is ready. Just add your source token and start monitoring your application logs and metrics!

**Note:** The Better Stack collector (Docker-based) requires Linux kernel 5.14+ for eBPF auto-instrumentation, which is not available on macOS. The HTTP API integration provided here works perfectly for your Next.js application and provides comprehensive logging and monitoring capabilities.

