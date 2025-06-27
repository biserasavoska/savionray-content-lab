#!/bin/bash

echo "🚀 Setting up staging environment..."

# Check if DATABASE_PUBLIC_URL is provided as argument
if [ -z "$1" ]; then
    echo "❌ Error: Please provide your Railway staging database URL"
    echo "Usage: ./scripts/setup-staging-env.sh 'postgresql://...'"
    echo ""
    echo "To get your staging database URL:"
    echo "1. Go to Railway Dashboard"
    echo "2. Select your staging project"
    echo "3. Go to Variables tab"
    echo "4. Copy the DATABASE_PUBLIC_URL value"
    exit 1
fi

STAGING_DB_URL="$1"

echo "📊 Using staging database: $STAGING_DB_URL"

# Set environment variables for staging operations
export DATABASE_URL="$STAGING_DB_URL"
export DATABASE_PUBLIC_URL="$STAGING_DB_URL"

echo "🗑️  Dropping all tables..."
npx prisma db push --force-reset

echo "🔄 Running migrations..."
npx prisma migrate deploy

echo "🌱 Seeding database..."
npx prisma db seed

echo "✅ Staging database reset and seeded successfully!"
echo ""
echo "📋 Test users created:"
echo "  - Creative: creative@savionray.com / password123"
echo "  - Client: client@savionray.com / password123"
echo "  - Admin: admin@savionray.com / password123"
echo ""
echo "🎯 Content Review page should now show content drafts for approved ideas!"
echo "🎯 Next steps:"
echo "1. Update Railway staging environment variables:"
echo "   - NEXTAUTH_URL=https://your-staging-domain.railway.app"
echo "   - NEXTAUTH_SECRET=your-staging-secret"
echo "2. Deploy to staging"
echo "3. Test login with the credentials above" 