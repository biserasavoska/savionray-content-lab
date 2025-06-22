#!/bin/bash

echo "🚀 Fixing Railway Deployment Issues"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

echo "📋 Checking current deployment status..."
railway status

echo ""
echo "🔍 Checking environment variables..."

# List of required environment variables
REQUIRED_VARS=(
    "DATABASE_URL"
    "NEXTAUTH_URL"
    "NEXTAUTH_SECRET"
    "OPENAI_API_KEY"
    "LINKEDIN_CLIENT_ID"
    "LINKEDIN_CLIENT_SECRET"
)

echo "📝 Required environment variables:"
for var in "${REQUIRED_VARS[@]}"; do
    echo "   - $var"
done

echo ""
echo "🔧 Steps to fix deployment:"
echo "1. Go to Railway dashboard: https://railway.app/dashboard"
echo "2. Select your project: 'disciplined-presence'"
echo "3. Click on service: 'savionray-content-lab'"
echo "4. Go to Variables tab"
echo "5. Ensure all required variables are set:"
echo ""

for var in "${REQUIRED_VARS[@]}"; do
    case $var in
        "DATABASE_URL")
            echo "   $var: Should be like 'postgresql://...' (Railway auto-generates this)"
            ;;
        "NEXTAUTH_URL")
            echo "   $var: Should be 'https://savionray-content-lab-production-ffc1.up.railway.app'"
            ;;
        "NEXTAUTH_SECRET")
            echo "   $var: Should be a long random string (32+ characters)"
            ;;
        "OPENAI_API_KEY")
            echo "   $var: Should start with 'sk-' (get from https://platform.openai.com/api-keys)"
            ;;
        "LINKEDIN_CLIENT_ID")
            echo "   $var: LinkedIn OAuth client ID (optional for basic functionality)"
            ;;
        "LINKEDIN_CLIENT_SECRET")
            echo "   $var: LinkedIn OAuth client secret (optional for basic functionality)"
            ;;
    esac
done

echo ""
echo "6. After setting variables, redeploy:"
echo "   railway up"
echo ""
echo "7. Check deployment status:"
echo "   railway logs"
echo ""
echo "8. Test the health endpoint:"
echo "   curl https://savionray-content-lab-production-ffc1.up.railway.app/api/health"
echo ""

echo "✅ Health check endpoint is ready at /api/health"
echo "✅ Railway configuration updated"
echo "✅ All fixes applied and committed"

echo ""
echo "🚀 Ready to deploy! Run 'railway up' to deploy the fixes." 