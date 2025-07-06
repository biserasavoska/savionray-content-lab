#!/bin/bash

# Fix Production Database Script
# This script helps fix database issues in production

set -e

echo "🔧 Production Database Fix Script"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "prisma/schema.prisma" ]; then
    echo "❌ Error: prisma/schema.prisma not found. Please run this script from the project root."
    exit 1
fi

echo ""
echo "📋 Available commands:"
echo "1. Check database connection"
echo "2. Run database migrations"
echo "3. Check migration status"
echo "4. Reset database (DANGEROUS - will delete all data)"
echo "5. Seed database with test data"
echo ""

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo "🔍 Checking database connection..."
        npx prisma db pull
        echo "✅ Database connection successful!"
        ;;
    2)
        echo "🚀 Running database migrations..."
        npx prisma migrate deploy
        echo "✅ Migrations completed successfully!"
        ;;
    3)
        echo "📊 Checking migration status..."
        npx prisma migrate status
        ;;
    4)
        echo "⚠️  WARNING: This will delete ALL data in the database!"
        read -p "Are you sure you want to reset the database? (yes/no): " confirm
        if [ "$confirm" = "yes" ]; then
            echo "🗑️  Resetting database..."
            npx prisma migrate reset --force
            echo "✅ Database reset completed!"
        else
            echo "❌ Database reset cancelled."
        fi
        ;;
    5)
        echo "🌱 Seeding database with test data..."
        npx prisma db seed
        echo "✅ Database seeded successfully!"
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "🎉 Operation completed!"
echo ""
echo "💡 Next steps:"
echo "1. Test creating an idea in your production app"
echo "2. If it still fails, check the production logs for specific errors"
echo "3. Make sure your DATABASE_URL environment variable is correct" 