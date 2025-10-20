#!/bin/bash

# Keep Alive Script for Development Server
# Runs the stable dev server and monitors it

echo "🔧 Starting Keep-Alive Monitor for Dev Server..."
echo "Press Ctrl+C to stop"

while true; do
    # Check if server is responding
    if ! curl -s -f http://localhost:3000 > /dev/null 2>&1; then
        echo "⚠️  Server not responding, restarting..."
        
        # Kill any existing processes
        pkill -f "next dev" 2>/dev/null
        pkill -f "dev-server-stable" 2>/dev/null
        sleep 2
        
        # Start fresh
        echo "🚀 Starting dev server..."
        npm run dev:stable > /tmp/dev-keepalive.log 2>&1 &
        
        # Wait for startup
        sleep 8
        
        # Check if it's working
        if curl -s -f http://localhost:3000 > /dev/null 2>&1; then
            echo "✅ Server restarted successfully"
        else
            echo "❌ Failed to restart server"
        fi
    else
        echo "✅ Server is healthy ($(date +%H:%M:%S))"
    fi
    
    # Check every 30 seconds
    sleep 30
done
