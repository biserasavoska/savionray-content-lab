#!/bin/bash

echo "🧹 Cleaning up development environment..."

# Kill all node processes
echo "Stopping all Node.js processes..."
pkill -9 -f node 2>/dev/null
sleep 2

# Clear ports
echo "Clearing development ports..."
lsof -ti:3000,3001,3002,4001 | xargs kill -9 2>/dev/null
sleep 1

# Remove caches
echo "Removing build caches..."
rm -rf .next node_modules/.cache tsconfig.tsbuildinfo .turbo 2>/dev/null

echo "✅ Cleanup complete!"
echo ""
echo "Starting stable dev server with auto-restart..."
npm run dev:stable

