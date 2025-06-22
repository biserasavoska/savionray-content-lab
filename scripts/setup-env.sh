#!/bin/bash

echo "🔧 Setting up environment variables..."

# Generate a new NEXTAUTH_SECRET
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Create .env file
cat > .env << EOF
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/savionray_content_lab"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="${NEXTAUTH_SECRET}"

# OpenAI
OPENAI_API_KEY="your-openai-api-key-here"

# LinkedIn OAuth (optional for local development)
LINKEDIN_CLIENT_ID="your-linkedin-client-id"
LINKEDIN_CLIENT_SECRET="your-linkedin-client-secret"
EOF

echo "✅ Environment file created!"
echo ""
echo "📝 Next steps:"
echo "1. Edit .env file and add your actual API keys:"
echo "   - OPENAI_API_KEY: Get from https://platform.openai.com/api-keys"
echo "   - LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET (optional)"
echo ""
echo "2. Start the database:"
echo "   docker-compose up -d"
echo ""
echo "3. Run migrations and seed:"
echo "   npx prisma migrate deploy"
echo "   npx prisma db seed"
echo ""
echo "4. Start the development server:"
echo "   npm run dev" 