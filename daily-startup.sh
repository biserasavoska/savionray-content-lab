#!/bin/bash
# daily-startup.sh

echo "🌅 Starting development day..."

# Check for existing processes
if pgrep -f "next dev" > /dev/null; then
  echo "⚠️  Next.js already running, stopping..."
  pkill -f "next dev"
  sleep 2
fi

# Clean if needed (only if issues yesterday)
if [ -d ".next" ]; then
  echo "🧹 Cleaning build artifacts..."
  rm -rf .next
fi

# Start fresh
echo "🚀 Starting development server..."
npm run dev &

# Verify
sleep 5
curl -I http://localhost:3000 > /dev/null 2>&1 && echo "✅ Ready to code!" || echo "❌ Check server logs"
