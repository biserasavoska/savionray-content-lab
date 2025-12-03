# Local Database Setup Guide

## Problem
Your `.env.local` had `DATABASE_URL=file:./dev.db` (SQLite), but the project requires PostgreSQL.

## Solution Options

### Option 1: Install Docker (Recommended)

1. **Install Docker Desktop for Mac:**
   - Download from: https://www.docker.com/products/docker-desktop
   - Install and start Docker Desktop

2. **Start PostgreSQL:**
   ```bash
   docker compose up -d postgres
   ```

3. **Run migrations and seed:**
   ```bash
   npx prisma migrate deploy
   npm run seed
   ```

### Option 2: Install PostgreSQL Locally

1. **Install PostgreSQL:**
   ```bash
   # Using Homebrew
   brew install postgresql@15
   brew services start postgresql@15
   ```

2. **Create database:**
   ```bash
   createdb savionray_content_lab
   ```

3. **Update .env.local DATABASE_URL:**
   ```
   DATABASE_URL=postgresql://$(whoami)@localhost:5432/savionray_content_lab
   ```

4. **Run migrations and seed:**
   ```bash
   npx prisma migrate deploy
   npm run seed
   ```

### Option 3: Use Railway Database (Quick Setup)

If you have a Railway account:

1. **Create a new PostgreSQL database in Railway**
2. **Copy the database connection string**
3. **Update .env.local:**
   ```
   DATABASE_URL=postgresql://user:password@host:port/database
   ```
4. **Run migrations and seed:**
   ```bash
   npx prisma migrate deploy
   npm run seed
   ```

## After Setup

Once your database is running, verify it works:

```bash
# Check if users exist
npm run seed  # This will create test users if they don't exist

# Test login credentials:
# - creative@savionray.com / password123
# - client@savionray.com / password123
# - admin@savionray.com / password123
# - bisera@savionray.com / SavionRay2025!
```

## Current .env.local Configuration

Your `.env.local` has been updated to:
```
DATABASE_URL=postgresql://postgres:password123@localhost:5432/savionray_content_lab
```

This assumes:
- PostgreSQL running on localhost:5432
- Username: postgres
- Password: password123
- Database: savionray_content_lab





