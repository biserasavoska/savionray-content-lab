#!/bin/bash

# SavionRay Content Lab - Development Reset Script
# This script automates common troubleshooting procedures for local development

set -e

echo "🔄 SavionRay Content Lab - Development Reset Script"
echo "=================================================="

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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to kill processes on specific port
kill_port() {
    local port=$1
    if lsof -ti:$port >/dev/null 2>&1; then
        print_status "Killing processes on port $port..."
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        print_success "Killed processes on port $port"
    else
        print_status "No processes found on port $port"
    fi
}

# Function to check if database is accessible
check_database() {
    if command_exists npx; then
        if npx prisma db execute --stdin <<< "SELECT 1;" >/dev/null 2>&1; then
            return 0
        else
            return 1
        fi
    else
        return 1
    fi
}

# Parse command line arguments
RESET_DB=false
QUICK_MODE=false
HELP=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --reset-db)
            RESET_DB=true
            shift
            ;;
        --quick)
            QUICK_MODE=true
            shift
            ;;
        --help|-h)
            HELP=true
            shift
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

if [ "$HELP" = true ]; then
    echo "Usage: ./scripts/dev-reset.sh [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --reset-db    Reset and reseed the database"
    echo "  --quick       Quick reset (skip database operations)"
    echo "  --help, -h    Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./scripts/dev-reset.sh              # Standard reset"
    echo "  ./scripts/dev-reset.sh --reset-db   # Reset with database"
    echo "  ./scripts/dev-reset.sh --quick      # Quick reset only"
    exit 0
fi

echo ""
print_status "Starting development environment reset..."

# Step 1: Stop all development processes
print_status "Step 1: Stopping all development processes..."

# Kill Next.js processes
if pkill -f "next dev" 2>/dev/null; then
    print_success "Killed Next.js development servers"
else
    print_status "No Next.js processes found"
fi

# Kill processes on common development ports
kill_port 3000
kill_port 3001
kill_port 3002
kill_port 5555

# Wait for processes to terminate
print_status "Waiting for processes to terminate..."
sleep 3

# Step 2: Clean build artifacts
print_status "Step 2: Cleaning build artifacts..."

if [ -d ".next" ]; then
    rm -rf .next
    print_success "Removed .next directory"
else
    print_status ".next directory not found"
fi

if [ -d "node_modules/.cache" ]; then
    rm -rf node_modules/.cache
    print_success "Removed node_modules cache"
else
    print_status "node_modules cache not found"
fi

# Step 3: Database operations (if requested)
if [ "$RESET_DB" = true ] && [ "$QUICK_MODE" = false ]; then
    print_status "Step 3: Resetting database..."
    
    if check_database; then
        if command_exists npx; then
            print_status "Running database migrations..."
            npx prisma migrate reset --force
            
            print_status "Seeding database..."
            npx prisma db seed
            
            print_success "Database reset and seeded successfully"
        else
            print_error "npx not found. Please install Node.js and npm."
            exit 1
        fi
    else
        print_warning "Database not accessible. Skipping database operations."
        print_status "You may need to start your database service first."
    fi
elif [ "$QUICK_MODE" = true ]; then
    print_status "Step 3: Skipping database operations (quick mode)"
else
    print_status "Step 3: Database operations skipped (use --reset-db to include)"
fi

# Step 4: Verify environment
print_status "Step 4: Verifying environment..."

# Check if package.json exists
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Are you in the correct directory?"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_warning "node_modules not found. Installing dependencies..."
    npm install
fi

# Check if Prisma client is generated
if [ -f "prisma/schema.prisma" ] && [ ! -d "node_modules/.prisma" ]; then
    print_status "Generating Prisma client..."
    npx prisma generate
fi

# Step 5: Start development server
print_status "Step 5: Starting development server..."

# Check if port 3000 is available
if lsof -ti:3000 >/dev/null 2>&1; then
    print_warning "Port 3000 is still in use. The server may start on a different port."
fi

print_status "Starting npm run dev..."
print_status "The server will be available at http://localhost:3000 (or next available port)"
echo ""

# Start the development server in the background
npm run dev &
DEV_PID=$!

# Wait a moment for the server to start
sleep 5

# Check if the server started successfully
if kill -0 $DEV_PID 2>/dev/null; then
    print_success "Development server started successfully (PID: $DEV_PID)"
    
    # Try to check which port it's running on
    sleep 2
    if curl -s http://localhost:3000 >/dev/null 2>&1; then
        print_success "Server is running on http://localhost:3000"
    elif curl -s http://localhost:3001 >/dev/null 2>&1; then
        print_success "Server is running on http://localhost:3001"
    elif curl -s http://localhost:3002 >/dev/null 2>&1; then
        print_success "Server is running on http://localhost:3002"
    else
        print_warning "Server started but port not detected. Check terminal output."
    fi
else
    print_error "Failed to start development server"
    exit 1
fi

echo ""
print_success "Development environment reset completed!"
echo ""
echo "📋 Next steps:"
echo "1. Open your browser and navigate to the server URL"
echo "2. Test authentication with the provided test users"
echo "3. Verify that all features are working correctly"
echo ""
echo "🔧 If you encounter issues:"
echo "- Check the terminal output for error messages"
echo "- Refer to LOCAL_DEVELOPMENT_TROUBLESHOOTING_GUIDE.md"
echo "- Run this script again with --reset-db if needed"
echo ""
echo "🛑 To stop the development server:"
echo "Press Ctrl+C in the terminal or run: pkill -f 'next dev'"
echo ""

# Keep the script running to maintain the background process
wait $DEV_PID 