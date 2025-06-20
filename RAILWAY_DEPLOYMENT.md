# Railway Deployment Guide

## 🚀 Deploy to Railway

### Step 1: Prepare Your Repository

1. **Commit all changes**:
   ```bash
   git add .
   git commit -m "feat: Prepare for Railway deployment"
   git push origin main
   ```

2. **Ensure your repository is on GitHub/GitLab** (Railway needs access)

### Step 2: Deploy to Railway

1. **Go to [Railway.app](https://railway.app)** and sign up/login
2. **Click "New Project"** → "Deploy from GitHub repo"
3. **Select your repository**: `savionray-content-lab`
4. **Railway will automatically detect** it's a Next.js app

### Step 3: Add PostgreSQL Database

1. **In your Railway project**, click "New" → "Database" → "PostgreSQL"
2. **Railway will create** a PostgreSQL database
3. **Copy the DATABASE_URL** from the database variables

### Step 4: Configure Environment Variables

In your Railway project settings, add these environment variables:

#### Required Variables:
```bash
DATABASE_URL="postgresql://..." # Provided by Railway PostgreSQL
NEXTAUTH_URL="https://your-app-name.railway.app"
NEXTAUTH_SECRET="generate-a-secure-secret-key"
OPENAI_API_KEY="sk-proj-your-openai-key"
```

#### Optional Variables:
```bash
# LinkedIn OAuth
LINKEDIN_CLIENT_ID="your-linkedin-client-id"
LINKEDIN_CLIENT_SECRET="your-linkedin-client-secret"

# AWS S3 (for file uploads)
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="your-s3-bucket-name"

# HubSpot CRM
HUBSPOT_ACCESS_TOKEN="your-hubspot-token"

# Stripe Payments
STRIPE_SECRET_KEY="sk_test_your-stripe-key"
STRIPE_PUBLISHABLE_KEY="pk_test_your-stripe-key"
STRIPE_WEBHOOK_SECRET="whsec_your-webhook-secret"
```

### Step 5: Deploy and Setup Database

1. **Railway will automatically deploy** your app
2. **Wait for deployment** to complete
3. **Run database migrations**:
   - Go to your app's deployment
   - Click "Deployments" → "Latest" → "View Logs"
   - Add a custom command: `npx prisma migrate deploy`
   - Run it

4. **Seed the database**:
   - Add another custom command: `npx prisma db seed`
   - Run it

### Step 6: Test the Deployment

1. **Visit your app URL**: `https://your-app-name.railway.app`
2. **Test login** with the seeded users:
   - `creative@savionray.com`
   - `client@savionray.com`
   - `admin@savionray.com`
   - (Password can be anything for these test accounts)

## 👥 Team Access Setup

### Option 1: Railway Team Access (Recommended)

1. **In Railway project**, go to "Settings" → "Team"
2. **Invite team members** by email
3. **Set permissions**:
   - **Viewers**: Can view deployments and logs
   - **Developers**: Can deploy and manage environment variables
   - **Admins**: Full access

### Option 2: Shared Login Credentials

Create team accounts in the app:

1. **Login as admin** to your deployed app
2. **Create new users** through the app interface
3. **Share credentials** with your team

### Option 3: OAuth with LinkedIn

1. **Set up LinkedIn OAuth**:
   - Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
   - Create a new app
   - Add redirect URL: `https://your-app-name.railway.app/api/auth/linkedin/callback`
   - Copy Client ID and Secret to Railway environment variables

2. **Team members can login** with their LinkedIn accounts

## 🔧 Post-Deployment Configuration

### Custom Domain (Optional)

1. **In Railway project**, go to "Settings" → "Domains"
2. **Add custom domain**: `content-lab.yourcompany.com`
3. **Update DNS** as instructed by Railway
4. **Update NEXTAUTH_URL** to your custom domain

### Environment-Specific Settings

#### Production Environment Variables:
```bash
NODE_ENV=production
NEXTAUTH_URL=https://your-domain.com
```

#### Development Environment Variables:
```bash
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3000
```

## 📊 Monitoring and Logs

### View Application Logs

1. **In Railway project**, go to "Deployments"
2. **Click on latest deployment** → "View Logs"
3. **Monitor for errors** and performance issues

### Health Checks

Railway automatically checks your app at `/` endpoint. Ensure your app responds quickly.

## 🔒 Security Considerations

### Environment Variables

- ✅ **Never commit** `.env` files to git
- ✅ **Use Railway's** environment variable system
- ✅ **Rotate secrets** regularly
- ✅ **Use strong** NEXTAUTH_SECRET

### Database Security

- ✅ **Railway PostgreSQL** is automatically secured
- ✅ **Connection strings** are encrypted
- ✅ **Backups** are automatic

## 🚨 Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```bash
# Check DATABASE_URL in Railway environment variables
# Ensure PostgreSQL service is running
```

#### 2. Authentication Errors
```bash
# Verify NEXTAUTH_SECRET is set
# Check NEXTAUTH_URL matches your domain
```

#### 3. OpenAI API Errors
```bash
# Verify OPENAI_API_KEY is correct
# Check API key has sufficient credits
```

#### 4. Build Failures
```bash
# Check Railway logs for build errors
# Ensure all dependencies are in package.json
```

### Getting Help

1. **Check Railway logs** for error details
2. **Verify environment variables** are set correctly
3. **Test locally** first to isolate issues
4. **Contact Railway support** if needed

## 📈 Scaling

### Automatic Scaling

Railway automatically scales your app based on traffic. No manual configuration needed.

### Manual Scaling

1. **In Railway project**, go to "Settings" → "Scaling"
2. **Adjust resources** as needed
3. **Monitor usage** and costs

---

## 🎉 Success!

Once deployed, your team can access the app at:
`https://your-app-name.railway.app`

**Default test users**:
- `creative@savionray.com`
- `client@savionray.com` 
- `admin@savionray.com`

**Features available**:
- ✅ User authentication
- ✅ Content idea management
- ✅ Text and visual draft generation
- ✅ Approval workflows
- ✅ Team collaboration 