#!/bin/bash

# Pre-Push Testing Reminder Script
# This script reminds developers to test before pushing to main

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 PRE-PUSH TESTING CHECK${NC}"
echo -e "${BLUE}========================${NC}"
echo ""

# Check if we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" = "main" ]; then
    echo -e "${RED}⚠️  WARNING: You're on the main branch!${NC}"
    echo -e "${YELLOW}Are you sure you want to push directly to main?${NC}"
    echo ""
    echo -e "${BLUE}Recommended workflow:${NC}"
    echo "1. Create a feature branch: git checkout -b feature/your-feature"
    echo "2. Make your changes"
    echo "3. Test thoroughly using the testing checklist"
    echo "4. Create a pull request"
    echo "5. Merge after review"
    echo ""
    read -p "Do you want to continue pushing to main? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${GREEN}✅ Push cancelled. Please use the recommended workflow.${NC}"
        exit 1
    fi
fi

# Check if testing checklist exists
if [ -f "TESTING_CHECKLIST.md" ]; then
    echo -e "${YELLOW}📋 Testing Checklist Found${NC}"
    echo -e "${BLUE}Please ensure you have completed the testing checklist before pushing:${NC}"
    echo -e "${BLUE}  📄 TESTING_CHECKLIST.md${NC}"
    echo ""
else
    echo -e "${RED}❌ Testing checklist not found!${NC}"
    echo "Please create TESTING_CHECKLIST.md before pushing."
    exit 1
fi

# Quick health checks
echo -e "${BLUE}🔍 Quick Health Checks${NC}"

# Check if package.json exists
if [ -f "package.json" ]; then
    echo -e "${GREEN}✅ package.json found${NC}"
else
    echo -e "${RED}❌ package.json not found${NC}"
    exit 1
fi

# Check if .env exists
if [ -f ".env" ]; then
    echo -e "${GREEN}✅ .env file found${NC}"
else
    echo -e "${YELLOW}⚠️  .env file not found - make sure environment variables are set${NC}"
fi

# Check if prisma schema exists
if [ -f "prisma/schema.prisma" ]; then
    echo -e "${GREEN}✅ Prisma schema found${NC}"
else
    echo -e "${RED}❌ Prisma schema not found${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}📋 Manual Testing Required${NC}"
echo "Before pushing, please manually verify:"
echo "1. ✅ Development server starts: npm run dev"
echo "2. ✅ Home page loads without errors"
echo "3. ✅ API endpoints work: curl http://localhost:3000/api/health"
echo "4. ✅ No console errors in browser"
echo "5. ✅ All modified features work as expected"
echo ""

# Ask for confirmation
echo -e "${YELLOW}Have you completed all the testing requirements?${NC}"
read -p "Type 'YES' to confirm you have tested thoroughly: " -r
if [[ ! $REPLY =~ ^YES$ ]]; then
    echo -e "${RED}❌ Push cancelled. Please complete testing first.${NC}"
    echo ""
    echo -e "${BLUE}💡 Quick testing commands:${NC}"
    echo "  npm run dev                    # Start development server"
    echo "  curl http://localhost:3000/api/health  # Test API"
    echo "  npx tsc --noEmit              # Check TypeScript errors"
    echo "  npx prisma studio             # Check database"
    echo ""
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Testing confirmed! Proceeding with push...${NC}"
echo -e "${BLUE}🚀 Remember: If issues are found in production, you can rollback using:${NC}"
echo "  git revert <commit-hash>"
echo ""

# Continue with the push
exit 0 