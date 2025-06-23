# 🚀 Quick Railway Fix Guide

## 🚨 **Your Railway deployment failed - Here's how to fix it:**

### **Step 1: Check Railway Dashboard**
1. Go to [Railway.app](https://railway.app)
2. Find your project: `savionray-content-lab`
3. Click on the failed deployment
4. Check the error logs

### **Step 2: Set Required Environment Variables**

In your Railway project, go to **Settings → Variables** and add:

```bash
# REQUIRED - Get this from Railway PostgreSQL
DATABASE_URL="postgresql://..." # Railway provides this automatically

# REQUIRED - Your app URL
NEXTAUTH_URL="https://savionray-content-lab-production.up.railway.app"

# REQUIRED - Generate a secure secret
NEXTAUTH_SECRET="your-secure-secret-key-here"

# REQUIRED - Your OpenAI API key
OPENAI_API_KEY="sk-proj-your-openai-key"

# OPTIONAL - Set to production
NODE_ENV="production"
```

### **Step 3: Generate NEXTAUTH_SECRET**

Run this command to generate a secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and use it as your `NEXTAUTH_SECRET`.

### **Step 4: Redeploy**

1. **Commit and push** the updated files:
   ```bash
   git add .
   git commit -m "fix: improve Railway deployment configuration"
   git push origin main
   ```

2. **Railway will automatically redeploy** when it detects the push

### **Step 5: Manual Database Setup (if needed)**

If the automatic database setup fails, run these commands in Railway:

1. Go to your Railway project
2. Click **Deployments** → **Latest** → **View Logs**
3. Add custom command: `npx prisma migrate deploy`
4. Add custom command: `npx prisma db seed`

### **Step 6: Test the App**

Once deployed, test with:
- URL: `https://savionray-content-lab-production.up.railway.app/`
- Login: `creative@savionray.com` (any password)

## 🔧 **Common Issues & Solutions**

### **Issue: "Database connection failed"**
- Check `DATABASE_URL` is set correctly
- Ensure PostgreSQL service is running in Railway

### **Issue: "Authentication failed"**
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain

### **Issue: "OpenAI API error"**
- Verify `OPENAI_API_KEY` is correct
- Check API key has sufficient credits

### **Issue: "Build failed"**
- Check Railway logs for specific build errors
- Ensure all dependencies are in `package.json`

## 📞 **Need Help?**

1. **Check Railway logs** for specific error messages
2. **Verify all environment variables** are set correctly
3. **Test locally first** to ensure the app works
4. **Contact Railway support** if needed

## ✅ **Success Indicators**

Your deployment is successful when you see:
- ✅ Build completed successfully
- ✅ Database migrations applied
- ✅ App starts without errors
- ✅ Health check passes at `/api/health`
- ✅ You can login with test accounts

---

**After following these steps, your app should be live and accessible to your team!** 