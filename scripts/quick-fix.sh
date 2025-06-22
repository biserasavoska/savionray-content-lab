#!/bin/bash

echo "🚀 Quick Fix for Deployment Issues"
echo "=================================="

# Stop any running processes
echo "🛑 Stopping any running processes..."
pkill -f "next dev" || true
pkill -f "npm run dev" || true

# Clear Next.js cache
echo "🧹 Clearing Next.js cache..."
rm -rf .next
rm -rf node_modules/.cache

# Clear browser cache (if possible)
echo "🌐 Clearing browser cache..."
echo "Please manually clear your browser cache or open in incognito mode"

# Setup environment if .env doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Setting up environment variables..."
    ./scripts/setup-env.sh
else
    echo "✅ .env file already exists"
fi

# Start database
echo "🗄️ Starting database..."
docker-compose up -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 5

# Run migrations
echo "🔄 Running database migrations..."
npx prisma migrate deploy

# Seed database
echo "🌱 Seeding database..."
npx prisma db seed

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building the project..."
npm run build

echo ""
echo "✅ Quick fix completed!"
echo ""
echo "🚀 Next steps:"
echo "1. Edit .env file and add your OpenAI API key"
echo "2. Start the development server: npm run dev"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "🔧 If you still see errors:"
echo "- Clear your browser cache completely"
echo "- Try opening in incognito/private mode"
echo "- Check that your OpenAI API key is valid" 