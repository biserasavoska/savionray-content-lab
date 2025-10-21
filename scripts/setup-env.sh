#!/bin/bash

# Setup script for monitoring environment variables
# This script creates the .env.local file with all required variables

echo "🔧 Setting up monitoring environment variables..."

# Create .env.local file
cat > .env.local << EOF
# Rollbar Error Tracking
ROLLBAR_SERVER_ACCESS_TOKEN=04c4928a2f754ab0bdc091733c7a8e26
NEXT_PUBLIC_ROLLBAR_CLIENT_ACCESS_TOKEN=5edea99b9891476885963e63bbbe691c
NEXT_PUBLIC_APP_VERSION=1.0.0

# Better Stack Logging
BETTERSTACK_SOURCE_TOKEN=KFgJg3R6QBRYaMtxU97zTJk7
BETTERSTACK_API_URL=https://logs.betterstack.com

# Checkly Monitoring
CHECKLY_ACCOUNT_ID=7ff4cdcc-25b1-48a0-83c3-233d4a86b1d9
CHECKLY_API_KEY=cu_2af377dd442447eb90a9187b4d4613b2

# Environment
NODE_ENV=development
EOF

echo "✅ Created .env.local file with all monitoring variables"
echo ""
echo "🚀 Next steps:"
echo "1. Restart your development server: npm run dev"
echo "2. Test the monitoring integrations:"
echo "   - Rollbar: http://localhost:3001/test-rollbar"
echo "   - Better Stack: http://localhost:3001/test-betterstack"
echo "3. Verify with: node scripts/verify-monitoring-env.js"
echo ""
echo "🎉 Your monitoring stack is now fully configured!"