# 🚨 Quick Troubleshooting Reference

## **Emergency Fix for Vendor Chunk Issues:**

```bash
# 1. Stop server
pkill -f "next dev"

# 2. Clean everything
rm -rf .next
rm -rf node_modules
rm -f package-lock.json

# 3. Reinstall
npm install

# 4. Restart
npm run dev
```

## **Common Error Messages & Solutions:**

### **❌ `Cannot find module './vendor-chunks/jose.js'`**
- **Cause:** Webpack vendor chunk generation failure
- **Solution:** Clean build artifacts and restart
- **Prevention:** Avoid aggressive webpack optimizations

### **❌ `Refused to apply style from '...' because its MIME type ('text/html')`**
- **Cause:** Static assets not being served correctly
- **Solution:** Clear `.next` directory and restart
- **Prevention:** Verify vendor chunks are generated

### **❌ `GET ... net::ERR_ABORTED 404 (Not Found)`**
- **Cause:** Missing JavaScript chunks
- **Solution:** Rebuild and verify chunk generation
- **Prevention:** Test after webpack configuration changes

## **Quick Health Check:**

```bash
# Check if vendor chunks exist
ls -la .next/server/vendor-chunks/

# Test static assets
curl -I "http://localhost:3000/_next/static/css/app/layout.css"

# Test main chunks
curl -I "http://localhost:3000/_next/static/chunks/app/layout.js"
```

## **Safe Webpack Config (Copy This):**

```javascript
const nextConfig = {
  experimental: {
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
    // Only bundle analyzer - safe
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
      config.plugins.push(new BundleAnalyzerPlugin())
    }
    return config
  },
}
```

## **🚫 NEVER Use These (They Break Things):**
- `optimizePackageImports`
- Custom `splitChunks`
- Aggressive webpack optimizations
- Experimental features without testing

---

**When in doubt: Clean, reinstall, restart!**
