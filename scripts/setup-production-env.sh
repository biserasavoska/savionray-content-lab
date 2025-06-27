#!/bin/bash

echo "🚨 Setting up PRODUCTION environment..."

# Check if DATABASE_PUBLIC_URL is provided as argument
if [ -z "$1" ]; then
    echo "❌ Error: Please provide your Railway production database URL"
    echo "Usage: ./scripts/setup-production-env.sh 'postgresql://...'"
    echo ""
    echo "⚠️  WARNING: This will reset your PRODUCTION database!"
    echo "Make sure you have a backup before proceeding."
    echo ""
    echo "To get your production database URL:"
    echo "1. Go to Railway Dashboard"
    echo "2. Select your production project"
    echo "3. Go to Variables tab"
    echo "4. Copy the DATABASE_PUBLIC_URL value"
    exit 1
fi

PRODUCTION_DB_URL="$1"

echo "📊 Using PRODUCTION database: $PRODUCTION_DB_URL"
echo ""
echo "⚠️  WARNING: This will reset your PRODUCTION database!"
echo "Make sure you have a backup before proceeding."
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Operation cancelled."
    exit 1
fi

# Set environment variables for production operations
export DATABASE_URL="$PRODUCTION_DB_URL"
export DATABASE_PUBLIC_URL="$PRODUCTION_DB_URL"

echo "🗑️  Dropping all tables..."
npx prisma db push --force-reset

echo "🔄 Running migrations..."
npx prisma migrate deploy

echo "🌱 Seeding database..."
npx prisma db seed

echo "✅ PRODUCTION database reset and seeded successfully!"
echo ""
echo "📋 Test users created:"
echo "  - Creative: creative@savionray.com / password123"
echo "  - Client: client@savionray.com / password123"
echo "  - Admin: admin@savionray.com / password123"
echo ""
echo "🎯 Content Review page should now show content drafts for approved ideas!"
echo ""
echo "🎯 Next steps:"
echo "1. Update Railway production environment variables:"
echo "   - NEXTAUTH_URL=https://your-production-domain.railway.app"
echo "   - NEXTAUTH_SECRET=your-production-secret"
echo "2. Deploy to production"
echo "3. Test login with the credentials above"
echo ""
echo "⚠️  IMPORTANT: Change the test passwords in production!" 