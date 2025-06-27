#!/bin/bash

echo "🔍 Verifying environment separation..."

# Check local environment
echo "📋 Local Environment (.env):"
if [ -f ".env" ]; then
    echo "✅ .env file exists"
    LOCAL_DB=$(grep "DATABASE_URL" .env | cut -d'=' -f2)
    if [[ "$LOCAL_DB" == *"localhost"* ]]; then
        echo "✅ Local DB points to localhost"
    else
        echo "❌ WARNING: Local DB does not point to localhost!"
        echo "   Current: $LOCAL_DB"
    fi
else
    echo "❌ .env file missing"
fi

echo ""

# Check for environment variable conflicts
echo "🔍 Checking for environment variable conflicts..."

# Check if any staging/production URLs are set locally
if [ ! -z "$DATABASE_PUBLIC_URL" ]; then
    echo "❌ WARNING: DATABASE_PUBLIC_URL is set locally!"
    echo "   This should only be set when working with staging/production"
    echo "   Current value: $DATABASE_PUBLIC_URL"
else
    echo "✅ DATABASE_PUBLIC_URL not set locally (good)"
fi

if [ ! -z "$RAILWAY_TOKEN" ]; then
    echo "❌ WARNING: RAILWAY_TOKEN is set locally!"
    echo "   This should only be set when working with Railway"
else
    echo "✅ RAILWAY_TOKEN not set locally (good)"
fi

echo ""

# Check NextAuth configuration
echo "🔐 NextAuth Configuration:"
NEXTAUTH_URL=$(grep "NEXTAUTH_URL" .env | cut -d'=' -f2 2>/dev/null)
if [[ "$NEXTAUTH_URL" == *"localhost"* ]]; then
    echo "✅ NEXTAUTH_URL points to localhost"
else
    echo "❌ WARNING: NEXTAUTH_URL does not point to localhost!"
    echo "   Current: $NEXTAUTH_URL"
fi

echo ""

# Check database connection
echo "🗄️  Database Connection Test:"
if npx prisma db pull > /dev/null 2>&1; then
    echo "✅ Database connection successful"
else
    echo "❌ Database connection failed"
fi

echo ""
echo "✅ Environment separation verification complete!" 