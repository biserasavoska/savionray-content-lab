#!/bin/bash

# Test LinkedIn integration on Railway
# This script helps debug the redirect_uri being sent to LinkedIn

echo "🔍 Testing LinkedIn Integration on Railway"
echo "=========================================="
echo ""

# Railway URL
RAILWAY_URL="https://savionray-content-lab-production-ffc1.up.railway.app"

echo "📍 Railway App URL: $RAILWAY_URL"
echo ""

# Step 1: Check if the connect endpoint exists
echo "1️⃣  Testing Connect Endpoint..."
CONNECT_RESPONSE=$(curl -sI "$RAILWAY_URL/api/auth/linkedin/connect" | head -n 20)
echo "$CONNECT_RESPONSE"
echo ""

# Step 2: Extract redirect location (should redirect to LinkedIn)
LOCATION=$(echo "$CONNECT_RESPONSE" | grep -i "location:" | cut -d' ' -f2 | tr -d '\r')
echo "2️⃣  Redirect Location:"
echo "$LOCATION"
echo ""

# Step 3: If redirected to LinkedIn, extract the redirect_uri parameter
if [[ "$LOCATION" == *"linkedin.com"* ]]; then
  echo "✅ Connect endpoint redirects to LinkedIn"
  echo ""
  echo "3️⃣  Extracting redirect_uri parameter..."
  REDIRECT_URI=$(echo "$LOCATION" | grep -oP 'redirect_uri=\K[^&]+' | python3 -c "import sys, urllib.parse as ul; print(ul.unquote(sys.stdin.read().strip()))")
  echo "📋 redirect_uri: $REDIRECT_URI"
  echo ""
  echo "🎯 ACTION REQUIRED:"
  echo "Add this EXACT URL to your LinkedIn Developer App:"
  echo ""
  echo "   $REDIRECT_URI"
  echo ""
  echo "Steps:"
  echo "1. Go to: https://www.linkedin.com/developers/apps"
  echo "2. Select your app"
  echo "3. Go to Auth tab"
  echo "4. Add the redirect_uri above to 'Authorized redirect URLs'"
  echo ""
elif [[ "$LOCATION" == *"auth/signin"* ]]; then
  echo "⚠️  Connect endpoint redirects to sign-in (no session)"
  echo ""
  echo "This is expected when not logged in."
  echo "The redirect_uri will be visible in Railway logs when a user"
  echo "clicks 'Connect LinkedIn' while logged in."
  echo ""
  echo "🔍 Check Railway logs for:"
  echo "   🔍 LinkedIn Connect Debug:"
  echo ""
  echo "Or log in to Railway app and click 'Connect LinkedIn' to see the redirect."
else
  echo "❌ Unexpected redirect location"
fi

echo ""
echo "4️⃣  Checking Environment Variables..."
echo "Expected NEXTAUTH_URL: $RAILWAY_URL"
echo ""
echo "To verify in Railway:"
echo "1. Go to Railway project"
echo "2. Click your service"
echo "3. Go to Variables tab"
echo "4. Check NEXTAUTH_URL matches: $RAILWAY_URL"
echo ""
echo "=========================================="
echo "✅ Test Complete"

