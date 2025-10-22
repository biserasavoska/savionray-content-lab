#!/bin/bash
# emergency-fix.sh - Run this script when app breaks

echo "🚨 EMERGENCY APP FIX STARTING..."

# Step 1: Stop everything
echo "1. Stopping all processes..."
pkill -f "next dev" 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:3002 | xargs kill -9 2>/dev/null || true
sleep 3

# Step 2: Clean everything
echo "2. Cleaning build artifacts..."
rm -rf .next
rm -rf node_modules/.cache
npm cache clean --force

# Step 3: Restart
echo "3. Starting fresh..."
npm run dev &

# Step 4: Verify
echo "4. Verifying server..."
sleep 5
curl -I http://localhost:3000 > /dev/null 2>&1 && echo "✅ Server running!" || echo "❌ Server failed!"

echo "🎉 EMERGENCY FIX COMPLETE!"
