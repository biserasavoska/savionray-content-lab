#!/bin/bash

# Quick Production Issue Diagnostic Script
# This script helps identify the specific cause of the 500 error

set -e

echo "🔍 Production Issue Diagnostic"
echo "=============================="

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

print_status "Step 2: Getting recent production logs..."
echo "Recent logs (last 20 lines):"
railway logs 2>/dev/null | tail -20 || print_error "Failed to get logs"

print_status "Step 3: Testing database connection..."
if railway run "npx prisma db execute --stdin <<< 'SELECT 1 as test;'" &> /dev/null; then
    print_success "Database connection works"
else
    print_error "Database connection failed - this is likely the issue!"
    print_status "The 500 error is probably due to database connection issues."
fi

print_status "Step 4: Checking migration status..."
railway run "npx prisma migrate status" || print_error "Failed to check migrations"

print_status "Step 5: Testing API health endpoint..."
if railway run "curl -f http://localhost:\$PORT/api/health" &> /dev/null; then
    print_success "Health endpoint works"
else
    print_error "Health endpoint failed - app might not be starting properly"
fi

print_status "Step 6: Checking environment variables..."
required_vars=("DATABASE_URL" "NEXTAUTH_SECRET" "NEXTAUTH_URL")
missing_vars=()

for var in "${required_vars[@]}"; do
    if railway variables get "$var" &> /dev/null; then
        print_success "$var is set"
    else
        missing_vars+=("$var")
        print_error "$var is missing"
    fi
done

if [ ${#missing_vars[@]} -eq 0 ]; then
    print_success "All required environment variables are set"
else
    print_error "Missing environment variables: ${missing_vars[*]}"
    print_status "This could be causing the 500 error!"
fi

echo ""
print_status "Diagnostic Summary:"
echo "======================"
echo "If you see database connection errors above, run:"
echo "  ./scripts/fix-production-railway.sh"
echo "  Then choose option 4 (Run database migrations)"
echo ""
echo "If you see missing environment variables, set them in Railway dashboard"
echo ""
echo "If the health endpoint fails, the app might not be building properly"
echo "Try running: railway up" 