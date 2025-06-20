# Version Control Guide - SavionRay Content Lab

## 🎯 Stable Version v1.0 - Backup Complete

Your stable version has been successfully backed up with multiple safety nets.

## 📋 What's in Stable Version v1.0

### ✅ Working Features
- User authentication (NextAuth.js)
- Content idea management
- Text content drafts with approval workflow
- **NEW: Visual draft generation with OpenAI DALL-E**
- Database with PostgreSQL (Docker)
- All tests passing
- Stable environment configuration

### 🔧 Technical Stack
- Next.js 14 with TypeScript
- Prisma ORM with PostgreSQL
- Tailwind CSS
- OpenAI API integration
- Docker for database

## 🚀 How to Return to Stable Version

### Option 1: Git Commands (Fastest)
```bash
# Return to exact stable commit
git checkout v1.0-stable

# Or switch to stable branch
git checkout stable-v1.0

# To return to main branch after testing
git checkout main
```

### Option 2: Backup Directory (Complete Restore)
```bash
# Navigate to backup directory
cd backup_stable_v1.0_20250620_232857

# Run restore script
./restore.sh
```

### Option 3: Manual Git Reset
```bash
# Reset to stable commit (WARNING: This will lose uncommitted changes)
git reset --hard v1.0-stable
```

## 🛡️ Safety Measures in Place

### 1. Git Tag
- **Tag**: `v1.0-stable`
- **Commit**: `8c57506`
- **Description**: "feat: Add Visual Drafts feature with stable environment setup"

### 2. Git Branch
- **Branch**: `stable-v1.0`
- **Status**: Points to stable commit
- **Safe to switch**: Always available

### 3. Complete Backup
- **Location**: `backup_stable_v1.0_20250620_232857/`
- **Contents**: All source code + configuration
- **Restore script**: Automated restoration process

## 🔄 Development Workflow

### Before Adding New Features
1. Ensure you're on `main` branch
2. Create a new feature branch: `git checkout -b feature/new-feature-name`
3. Make your changes
4. Test thoroughly

### If Something Breaks
1. **Quick fix**: `git checkout stable-v1.0` (test the fix)
2. **Complete reset**: `git reset --hard v1.0-stable`
3. **Full restore**: Use the backup directory

### After Successful Feature Addition
1. Commit your changes: `git add . && git commit -m "feat: description"`
2. Merge to main: `git checkout main && git merge feature/branch-name`
3. Update stable version if needed

## 📁 Backup Directory Structure
```
backup_stable_v1.0_20250620_232857/
├── restore.sh          # Automated restore script
├── README.md           # Backup documentation
├── .env               # Environment configuration
├── docker-compose.yml # Database setup
├── src/               # Complete source code
├── prisma/            # Database schema and migrations
└── ...                # All other project files
```

## 🔧 Environment Setup

### Required Environment Variables
```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/savionray_content_lab"
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
OPENAI_API_KEY=your-openai-key-here
```

### Quick Start Commands
```bash
# Install dependencies
npm install

# Start database
docker compose up -d

# Run migrations
npx prisma migrate dev

# Seed database
npx prisma db seed

# Start development server
npm run dev
```

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Expected Results
- ✅ All tests should pass
- ✅ No environment variable errors
- ✅ No authentication errors

## 🚨 Troubleshooting

### If Environment Variables Don't Load
1. Check `.env` file format (no line breaks in values)
2. Restart the development server
3. Verify file permissions

### If Database Connection Fails
1. Ensure Docker is running
2. Check if port 5433 is available
3. Run `docker compose up -d`

### If Authentication Fails
1. Verify `NEXTAUTH_SECRET` is set
2. Check `NEXTAUTH_URL` matches your setup
3. Clear browser cookies/session

## 📞 Emergency Contacts

If you need to restore the stable version:
1. **Git**: `git checkout v1.0-stable`
2. **Backup**: `cd backup_stable_v1.0_20250620_232857 && ./restore.sh`
3. **Manual**: Copy files from backup directory

---

**Created**: December 20, 2025
**Version**: v1.0-stable
**Status**: ✅ Fully functional and tested 