#!/bin/bash

# Railway Database Reset Script
# This script will completely reset the Railway database to match your local schema

set -e  # Exit on any error

echo "🚀 Railway Database Reset Script"
echo "=================================="

# Check if DATABASE_URL is provided
if [ -z "$1" ]; then
    echo "❌ Error: Please provide the Railway DATABASE_URL as the first argument"
    echo "Usage: ./scripts/reset-railway-db.sh 'postgresql://...'"
    echo ""
    echo "To get the DATABASE_URL:"
    echo "1. Go to https://railway.app/"
    echo "2. Find your project (savionray-content-lab-production)"
    echo "3. Click on the Database service"
    echo "4. Go to 'Connect' tab"
    echo "5. Copy the 'Postgres Connection URL'"
    exit 1
fi

RAILWAY_DATABASE_URL="$1"

echo "📋 Railway Database URL provided"
echo "🔒 This will COMPLETELY RESET the Railway database"
echo "⚠️  All existing data will be lost!"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Operation cancelled"
    exit 1
fi

echo ""
echo "🔄 Starting Railway database reset..."

# Step 1: Drop all tables
echo "📥 Step 1: Dropping all existing tables..."
psql "$RAILWAY_DATABASE_URL" << 'EOF'
-- Drop all tables in the public schema
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END $$;

-- Drop all sequences
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public') LOOP
        EXECUTE 'DROP SEQUENCE IF EXISTS ' || quote_ident(r.sequence_name) || ' CASCADE';
    END LOOP;
END $$;

-- Drop all enums
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT typname FROM pg_type WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public') AND typtype = 'e') LOOP
        EXECUTE 'DROP TYPE IF EXISTS ' || quote_ident(r.typname) || ' CASCADE';
    END LOOP;
END $$;
EOF

echo "✅ All tables dropped successfully"

# Step 2: Reset Prisma migration history
echo "📥 Step 2: Resetting Prisma migration history..."
rm -rf prisma/migrations
mkdir -p prisma/migrations

# Step 3: Create fresh migration
echo "📥 Step 3: Creating fresh migration..."
DATABASE_URL="$RAILWAY_DATABASE_URL" npx prisma migrate dev --name init --create-only

# Step 4: Apply migration to Railway
echo "📥 Step 4: Applying migration to Railway..."
DATABASE_URL="$RAILWAY_DATABASE_URL" npx prisma migrate deploy

# Step 5: Generate Prisma client
echo "📥 Step 5: Generating Prisma client..."
DATABASE_URL="$RAILWAY_DATABASE_URL" npx prisma generate

# Step 6: Seed the database
echo "📥 Step 6: Seeding the database..."
DATABASE_URL="$RAILWAY_DATABASE_URL" npx prisma db seed

echo ""
echo "🎉 Railway database reset completed successfully!"
echo ""
echo "✅ What was done:"
echo "   - Dropped all existing tables"
echo "   - Reset migration history"
echo "   - Created fresh migration"
echo "   - Applied migration to Railway"
echo "   - Generated Prisma client"
echo "   - Seeded with initial data"
echo ""
echo "🚀 Next steps:"
echo "   1. Railway should automatically redeploy your app"
echo "   2. Test the application at your Railway URL"
echo "   3. Try logging in with: admin@savionray.com"
echo ""
echo "🔗 Your Railway app should now be working!" 