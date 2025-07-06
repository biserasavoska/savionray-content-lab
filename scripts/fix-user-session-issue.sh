#!/bin/bash

# Fix User Session Issue Script
# This script helps fix the foreign key constraint violation

set -e

echo "🔧 Fix User Session Issue"
echo "========================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if Railway CLI is available
if ! command -v railway &> /dev/null; then
    print_error "Railway CLI not found. Please install: npm install -g @railway/cli"
    exit 1
fi

print_status "Step 1: Checking Railway connection..."
if ! railway whoami &> /dev/null; then
    print_error "Not logged into Railway. Please run: railway login"
    exit 1
fi
print_success "Connected to Railway"

print_status "Step 2: Checking if database migrations are needed..."
railway run "npx prisma migrate status" || {
    print_error "Failed to check migration status"
    exit 1
}

print_status "Step 3: Running database migrations..."
railway run "npx prisma migrate deploy" || {
    print_error "Migration failed"
    print_status "This might be the root cause of the issue"
    exit 1
}

print_status "Step 4: Checking if seed data is needed..."
railway run "npx prisma db seed" || {
    print_warning "Seeding failed or not needed"
}

print_status "Step 5: Checking user table..."
railway run "npx prisma db execute --stdin <<< 'SELECT COUNT(*) as user_count FROM \"User\";'" || {
    print_error "Failed to check user table"
    exit 1
}

print_status "Step 6: Restarting the application..."
railway up || {
    print_error "Failed to restart application"
    exit 1
}

print_success "Fix completed!"
echo ""
print_status "Next steps:"
echo "1. Try creating an idea again in production"
echo "2. If it still fails, check the logs with: railway logs"
echo "3. The issue might be that your session user doesn't exist in the production database" 