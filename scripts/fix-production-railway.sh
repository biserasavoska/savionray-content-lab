#!/bin/bash

# Railway Production Fix Script
# This script helps diagnose and fix common Railway production issues

set -e

echo "🔧 Railway Production Fix Script"
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "prisma/schema.prisma" ]; then
    print_error "prisma/schema.prisma not found. Please run this script from the project root."
    exit 1
fi

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    print_error "Railway CLI not found. Please install it first:"
    echo "npm install -g @railway/cli"
    exit 1
fi

print_status "Available commands:"
echo "1. Check Railway connection and project status"
echo "2. Check production environment variables"
echo "3. Check production database connection"
echo "4. Run database migrations in production"
echo "5. Check production logs"
echo "6. Deploy latest changes"
echo "7. Full production health check"
echo ""

read -p "Enter your choice (1-7): " choice

case $choice in
    1)
        print_status "Checking Railway connection and project status..."
        
        # Check if logged in
        if ! railway whoami &> /dev/null; then
            print_error "Not logged into Railway. Please run: railway login"
            exit 1
        fi
        
        # Check project status
        print_status "Project status:"
        railway status || print_error "Failed to get project status"
        
        # Check environment
        print_status "Current environment:"
        railway environment || print_error "Failed to get environment"
        ;;
        
    2)
        print_status "Checking production environment variables..."
        
        # List environment variables (without showing values for security)
        print_status "Environment variables in production:"
        railway variables list || print_error "Failed to list environment variables"
        
        # Check for required variables
        print_status "Checking for required environment variables..."
        required_vars=("DATABASE_URL" "NEXTAUTH_SECRET" "NEXTAUTH_URL")
        
        for var in "${required_vars[@]}"; do
            if railway variables get "$var" &> /dev/null; then
                print_success "$var is set"
            else
                print_error "$var is missing"
            fi
        done
        ;;
        
    3)
        print_status "Checking production database connection..."
        
        # Test database connection
        print_status "Testing database connection..."
        railway run "npx prisma db execute --stdin <<< 'SELECT 1 as test;'" || {
            print_error "Database connection failed"
            print_status "This might be due to:"
            echo "  - Missing DATABASE_URL environment variable"
            echo "  - Database not accessible from Railway"
            echo "  - Database credentials are incorrect"
        }
        ;;
        
    4)
        print_status "Running database migrations in production..."
        
        print_warning "This will modify the production database. Are you sure? (y/N)"
        read -p "" confirm
        
        if [[ $confirm =~ ^[Yy]$ ]]; then
            print_status "Running migrations..."
            railway run "npx prisma migrate deploy" || {
                print_error "Migration failed"
                print_status "Check the logs above for specific errors"
            }
            
            print_status "Checking migration status..."
            railway run "npx prisma migrate status" || print_error "Failed to check migration status"
        else
            print_status "Migration cancelled"
        fi
        ;;
        
    5)
        print_status "Checking production logs..."
        
        print_status "Recent logs:"
        railway logs --tail 50 || print_error "Failed to get logs"
        ;;
        
    6)
        print_status "Deploying latest changes..."
        
        print_status "Building and deploying..."
        railway up || {
            print_error "Deployment failed"
            print_status "Check the logs above for specific errors"
        }
        
        print_status "Deployment completed. Checking health..."
        sleep 10
        railway run "curl -f http://localhost:\$PORT/api/health" || print_warning "Health check failed"
        ;;
        
    7)
        print_status "Running full production health check..."
        
        # Check Railway connection
        print_status "1. Checking Railway connection..."
        if ! railway whoami &> /dev/null; then
            print_error "Not logged into Railway"
            exit 1
        fi
        print_success "Connected to Railway"
        
        # Check environment variables
        print_status "2. Checking environment variables..."
        required_vars=("DATABASE_URL" "NEXTAUTH_SECRET" "NEXTAUTH_URL")
        missing_vars=()
        
        for var in "${required_vars[@]}"; do
            if ! railway variables get "$var" &> /dev/null; then
                missing_vars+=("$var")
            fi
        done
        
        if [ ${#missing_vars[@]} -eq 0 ]; then
            print_success "All required environment variables are set"
        else
            print_error "Missing environment variables: ${missing_vars[*]}"
        fi
        
        # Check database connection
        print_status "3. Checking database connection..."
        if railway run "npx prisma db execute --stdin <<< 'SELECT 1 as test;'" &> /dev/null; then
            print_success "Database connection successful"
        else
            print_error "Database connection failed"
        fi
        
        # Check migrations
        print_status "4. Checking database migrations..."
        railway run "npx prisma migrate status" || print_error "Failed to check migration status"
        
        # Check app health
        print_status "5. Checking application health..."
        if railway run "curl -f http://localhost:\$PORT/api/health" &> /dev/null; then
            print_success "Application is healthy"
        else
            print_error "Application health check failed"
        fi
        
        print_status "Health check completed"
        ;;
        
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

print_status "Script completed" 