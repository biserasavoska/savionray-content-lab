# Webpack Configuration Best Practices & Troubleshooting Guide

## 🚨 **Critical Issue: Vendor Chunk Resolution Failures**

### **Symptoms:**
- `Cannot find module './vendor-chunks/jose.js'`
- `Cannot find module './vendor-chunks/@panva.js'`
- `Cannot find module './vendor-chunks/@swc.js'`
- Static assets returning `text/html` MIME type instead of proper types
- 404 errors for critical JavaScript chunks
- Authentication endpoints crashing with module resolution errors

### **Root Cause:**
Aggressive webpack optimizations in `next.config.js` that interfere with NextAuth's vendor chunk generation.

## 🔧 **How to Fix (Immediate Solution):**

### **1. Remove Problematic Webpack Configurations:**

```javascript
// ❌ REMOVE THESE - They cause vendor chunk issues
experimental: {
  optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'], // REMOVE
},
webpack: (config, { dev, isServer }) => {
  // ❌ REMOVE THIS - Interferes with NextAuth vendor chunks
  if (!dev && !isServer) {
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          enforce: true,
        },
      },
    }
  }
  return config
}
```

### **2. Use Safe Configuration:**

```javascript
// ✅ SAFE CONFIGURATION
const nextConfig = {
  experimental: {
    // Only use turbo for SVG handling
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  
  webpack: (config, { dev, isServer }) => {
    // Only add bundle analyzer if needed
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
        })
      )
    }
    return config
  },
}
```

## 🧹 **Cleanup Process (When Issues Occur):**

### **1. Stop Development Server:**
```bash
pkill -f "next dev" || true
```

### **2. Clear Build Artifacts:**
```bash
rm -rf .next
rm -rf node_modules/.cache
rm -rf .swc
rm -rf .turbo
```

### **3. Reinstall Dependencies:**
```bash
rm -rf node_modules
rm -f package-lock.json
npm install
```

### **4. Restart Development Server:**
```bash
npm run dev
```

### **5. Verify Vendor Chunks:**
```bash
ls -la .next/server/vendor-chunks/
# Should include: jose.js, @panva.js, @swc.js, @next-auth.js
```

## 🚫 **What NOT to Do:**

### **❌ Avoid These Webpack Configurations:**
- `optimizePackageImports` - Causes package resolution conflicts
- Custom `splitChunks` - Interferes with Next.js default behavior
- Aggressive chunk splitting - Breaks vendor chunk generation
- Custom webpack optimizations without thorough testing

### **❌ Don't Modify Without Testing:**
- Webpack configuration
- Experimental features
- Bundle optimization settings
- Vendor chunk handling

## ✅ **Safe Webpack Optimizations:**

### **1. Bundle Analysis (Safe):**
```javascript
// Only enable when needed for debugging
if (process.env.ANALYZE === 'true') {
  const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
  config.plugins.push(new BundleAnalyzerPlugin())
}
```

### **2. SVG Handling (Safe):**
```javascript
experimental: {
  turbo: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
}
```

### **3. Image Optimization (Safe):**
```javascript
images: {
  formats: ['image/webp', 'image/avif'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
}
```

## 🔍 **Diagnostic Commands:**

### **Check Vendor Chunks:**
```bash
ls -la .next/server/vendor-chunks/
```

### **Test Static Assets:**
```bash
curl -I "http://localhost:3000/_next/static/css/app/layout.css"
curl -I "http://localhost:3000/_next/static/chunks/app/layout.js"
```

### **Test Authentication:**
```bash
curl -I "http://localhost:3000/api/auth/providers"
```

### **Check Build Output:**
```bash
npm run build
# Look for vendor chunk warnings or errors
```

## 📋 **Prevention Checklist:**

### **Before Making Webpack Changes:**
- [ ] Test in development mode
- [ ] Verify vendor chunks are generated
- [ ] Test authentication endpoints
- [ ] Check static asset serving
- [ ] Run production build
- [ ] Test in production-like environment

### **After Making Changes:**
- [ ] Restart development server
- [ ] Clear browser cache
- [ ] Test critical functionality
- [ ] Monitor console for errors
- [ ] Verify vendor chunk generation

## 🚨 **Emergency Rollback:**

### **If Issues Persist:**
```bash
# 1. Stop server
pkill -f "next dev"

# 2. Reset to last working commit
git reset --hard HEAD

# 3. Clean build artifacts
rm -rf .next
rm -rf node_modules

# 4. Reinstall dependencies
npm install

# 5. Restart server
npm run dev
```

## 📚 **Additional Resources:**

- [Next.js Webpack Configuration](https://nextjs.org/docs/app/api-reference/next-config-js/webpack)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Webpack Chunk Splitting](https://webpack.js.org/plugins/split-chunks-plugin/)

## 🎯 **Key Takeaways:**

1. **Keep webpack configuration minimal** - Less is more
2. **Test vendor chunk generation** after any webpack changes
3. **Avoid aggressive optimizations** that interfere with NextAuth
4. **Document all webpack changes** and their impact
5. **Have a rollback plan** ready for emergencies
6. **Test in production-like environments** before deploying

---

**Last Updated:** August 28, 2025  
**Issue Resolved:** Vendor chunk resolution failures due to aggressive webpack optimizations  
**Solution Applied:** Simplified webpack configuration, removed problematic optimizations
