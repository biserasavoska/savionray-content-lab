#!/bin/bash

# Backup Stable Version Script
# This script creates a complete backup of the current stable version

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="backup_stable_v1.0_${TIMESTAMP}"

echo "Creating backup of stable version v1.0..."
echo "Backup directory: $BACKUP_DIR"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Copy source code (excluding node_modules and .git)
rsync -av --exclude='node_modules' --exclude='.git' --exclude='.next' --exclude='backup_*' ./ "$BACKUP_DIR/"

# Copy important configuration files
cp .env "$BACKUP_DIR/"
cp docker-compose.yml "$BACKUP_DIR/"
cp package.json "$BACKUP_DIR/"
cp package-lock.json "$BACKUP_DIR/"

# Create a restore script
cat > "$BACKUP_DIR/restore.sh" << 'EOF'
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
EOF

chmod +x "$BACKUP_DIR/restore.sh"

# Create a README for the backup
cat > "$BACKUP_DIR/README.md" << 'EOF'
# Stable Version v1.0 Backup

This is a backup of the stable version v1.0 of the SavionRay Content Lab application.

## What's Included

- Complete source code
- Environment configuration (.env)
- Docker Compose setup
- Package dependencies
- Database migrations

## Features in this version

- ✅ User authentication with NextAuth.js
- ✅ Content idea management
- ✅ Text content drafts with approval workflow
- ✅ Visual draft generation with OpenAI DALL-E
- ✅ Database with PostgreSQL (Docker)
- ✅ All tests passing
- ✅ Stable environment configuration

## How to Restore

1. Navigate to this backup directory
2. Run: `./restore.sh`
3. The script will restore all files and restart the application

## Git Commands to Return to This Version

If you have git set up:
```bash
# Return to this exact commit
git checkout v1.0-stable

# Or switch to the stable branch
git checkout stable-v1.0
```

## Environment Variables Required

Make sure your .env file contains:
- DATABASE_URL
- NEXTAUTH_URL
- NEXTAUTH_SECRET
- OPENAI_API_KEY

Created: $(date)
EOF

echo "Backup created successfully in: $BACKUP_DIR"
echo ""
echo "To restore this version later, run:"
echo "cd $BACKUP_DIR && ./restore.sh"
echo ""
echo "Or use git:"
echo "git checkout v1.0-stable"
echo "git checkout stable-v1.0" 