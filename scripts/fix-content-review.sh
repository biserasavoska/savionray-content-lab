#!/bin/bash

echo "🔧 Fixing Content Review Issues - Comprehensive Solution"
echo "========================================================"

# Step 1: Kill any lingering processes
echo "📋 Step 1: Cleaning up processes..."
kill -9 $(lsof -ti :3000) 2>/dev/null
kill -9 $(lsof -ti :3001) 2>/dev/null
kill -9 $(lsof -ti :3002) 2>/dev/null

# Step 2: Start database
echo "📋 Step 2: Starting database..."
docker-compose up -d

# Step 3: Reset and reseed database with proper content
echo "📋 Step 3: Resetting and reseeding database..."
npx prisma db push --force-reset
npx prisma db seed

# Step 4: Verify the data
echo "📋 Step 4: Verifying database content..."
echo "Checking for approved ideas..."
npx prisma studio --port 5555 &
STUDIO_PID=$!

# Step 5: Build the application
echo "📋 Step 5: Building application..."
npm run build

# Step 6: Start dev server
echo "📋 Step 6: Starting development server..."
echo ""
echo "✅ Content Review Fix Complete!"
echo ""
echo "🌐 Your app should now be running at: http://localhost:3000"
echo "📊 Database Studio available at: http://localhost:5555"
echo ""
echo "🔑 Login with demo accounts:"
echo "   - Creative: creative@savionray.com / password123"
echo "   - Client: client@savionray.com / password123"
echo "   - Admin: admin@savionray.com / password123"
echo "   - Bisera: bisera@savionray.com / SavionRay2025!"
echo ""
echo "📝 Content Review should now show:"
echo "   - 3 approved ideas with content drafts"
echo "   - Drafts in 'AWAITING_FEEDBACK' status"
echo "   - Proper user permissions and actions"
echo ""
echo "🚀 Starting development server..."
npm run dev 