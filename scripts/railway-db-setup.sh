#!/bin/bash

# Railway Database Setup Script
# This script helps you set up the database in Railway

echo "🚀 Railway Database Setup Script"
echo "=================================="

echo ""
echo "📋 Step-by-Step Instructions:"
echo ""

echo "1️⃣  Go to your Railway project dashboard:"
echo "   https://railway.app/project/[your-project-id]"
echo ""

echo "2️⃣  Click on your app service"
echo ""

echo "3️⃣  Go to 'Deployments' tab"
echo ""

echo "4️⃣  Click on the latest deployment"
echo ""

echo "5️⃣  Click 'View Logs'"
echo ""

echo "6️⃣  Add a custom command and run:"
echo "   npx prisma migrate deploy"
echo ""

echo "7️⃣  After migrations complete, add another custom command:"
echo "   npx prisma db seed"
echo ""

echo "8️⃣  Wait for both commands to complete successfully"
echo ""

echo "9️⃣  Test the application:"
echo "   https://savionray-content-lab-production.up.railway.app/"
echo ""

echo "🔑 Test with these accounts:"
echo "   Email: creative@savionray.com (any password)"
echo "   Email: client@savionray.com (any password)"
echo "   Email: admin@savionray.com (any password)"
echo ""

echo "⚠️  If you get errors, check:"
echo "   - DATABASE_URL is set correctly in Railway"
echo "   - PostgreSQL service is running"
echo "   - Environment variables are properly configured"
echo ""

echo "📞 Need help? Check Railway logs for specific error messages"
echo ""

echo "✅ Success indicators:"
echo "   - Migrations complete without errors"
echo "   - Seed script runs successfully"
echo "   - You can login with test accounts"
echo "   - Content generation works"
echo ""

echo "🎯 Alternative: Manual User Creation"
echo "   If seeding doesn't work, try logging in with any email"
echo "   The system will automatically create a new user account"
echo "" 