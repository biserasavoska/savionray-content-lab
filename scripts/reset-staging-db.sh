#!/bin/bash

echo "🚀 Resetting and seeding staging database..."

# Check if DATABASE_PUBLIC_URL is set
if [ -z "$DATABASE_PUBLIC_URL" ]; then
    echo "❌ Error: DATABASE_PUBLIC_URL environment variable is not set"
    echo "Please set it to your Railway staging database connection string"
    exit 1
fi

echo "📊 Using staging database: $DATABASE_PUBLIC_URL"

# Set the database URL for this operation
export DATABASE_URL="$DATABASE_PUBLIC_URL"

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
echo "  - Bisera: bisera@savionray.com / SavionRay2025!"
echo ""
echo "📝 Content drafts created for approved ideas - Content Review page should now show content!" 