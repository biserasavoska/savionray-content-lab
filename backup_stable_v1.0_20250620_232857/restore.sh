#!/bin/bash
echo "Restoring stable version v1.0..."

# Stop any running processes
pkill -f "next dev" || true
docker compose down || true

# Restore files
cp -r * ../
cd ..

# Install dependencies
npm install

# Start database
docker compose up -d

# Run migrations
npx prisma migrate dev

# Seed database
npx prisma db seed

echo "Restore complete! Run 'npm run dev' to start the application."
