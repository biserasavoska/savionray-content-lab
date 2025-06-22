#!/bin/bash

# Railway CLI Setup Script
# This is an alternative method using Railway CLI

echo "🚀 Railway CLI Database Setup"
echo "=============================="
echo ""

echo "📋 Prerequisites:"
echo "1. Node.js installed"
echo "2. npm available"
echo "3. Railway account"
echo ""

echo "🔧 Step 1: Install Railway CLI"
echo "Run this command:"
echo "npm install -g @railway/cli"
echo ""

echo "🔑 Step 2: Login to Railway"
echo "Run this command:"
echo "railway login"
echo ""

echo "🔗 Step 3: Link to Your Project"
echo "Run this command:"
echo "railway link"
echo ""

echo "🗄️  Step 4: Run Database Migrations"
echo "Run this command:"
echo "railway run npx prisma migrate deploy"
echo ""

echo "🌱 Step 5: Seed the Database"
echo "Run this command:"
echo "railway run npx prisma db seed"
echo ""

echo "🧪 Step 6: Test the Application"
echo "Visit: https://savionray-content-lab-production.up.railway.app/"
echo "Try logging in with: creative@savionray.com (any password)"
echo ""

echo "📝 Complete Commands Sequence:"
echo "npm install -g @railway/cli"
echo "railway login"
echo "railway link"
echo "railway run npx prisma migrate deploy"
echo "railway run npx prisma db seed"
echo ""

echo "✅ Success Indicators:"
echo "- Migrations complete without errors"
echo "- Seed script runs successfully"
echo "- You can login to the application"
echo ""

echo "❌ If you get errors:"
echo "- Check if you're logged into Railway"
echo "- Verify your project is linked correctly"
echo "- Ensure DATABASE_URL is set in Railway"
echo ""

echo "🎯 Alternative: Manual User Creation"
echo "If CLI doesn't work, try logging in with any email"
echo "The system will automatically create a new user account"
echo "" 