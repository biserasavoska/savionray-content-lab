#!/bin/bash

echo "🔧 Fixing deployment issues..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

echo "📋 Checking environment variables..."

# Check for required environment variables
REQUIRED_VARS=(
    "DATABASE_URL"
    "NEXTAUTH_URL"
    "NEXTAUTH_SECRET"
    "OPENAI_API_KEY"
    "LINKEDIN_CLIENT_ID"
    "LINKEDIN_CLIENT_SECRET"
)

MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo "❌ Missing required environment variables:"
    for var in "${MISSING_VARS[@]}"; do
        echo "   - $var"
    done
    echo ""
    echo "Please set these variables in your Railway environment."
    exit 1
fi

echo "✅ All required environment variables are set"

echo "🗄️ Running database migrations..."
npx prisma migrate deploy

echo "🌱 Seeding database..."
npx prisma db seed

echo "🔨 Building the application..."
npm run build

echo "✅ Deployment fixes completed!"
echo ""
echo "📝 Next steps:"
echo "1. Deploy to Railway: railway up"
echo "2. Check deployment logs: railway logs"
echo "3. Verify the application is running: railway status" 