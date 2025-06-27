#!/bin/bash

# Script to set up staging database with clean schema and seed data
# This ensures staging has the same clean state as local

set -e

echo "🚀 Setting up staging database..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL environment variable is not set"
    echo "Please add it to your .env file:"
    echo "DATABASE_URL=postgresql://postgres:password@switchyard.proxy.rlwy.net:XXXX/railway"
    exit 1
fi

echo "✅ Using staging database: $DATABASE_URL"

echo "🔄 Resetting staging database..."
npx prisma db push --force-reset

if [ $? -eq 0 ]; then
    echo "✅ Database reset successful"
else
    echo "❌ Database reset failed"
    exit 1
fi

echo "🌱 Seeding staging database..."
npx prisma db seed

if [ $? -eq 0 ]; then
    echo "✅ Database seeding successful"
else
    echo "❌ Database seeding failed"
    exit 1
fi

echo "🎉 Staging database setup complete!"
echo "✅ Database reset and seeded with test data"
echo "✅ Test users created with passwords"
echo "✅ Ready for staging deployment" 