# Fix Database Connection

## Current Issue
PostgreSQL authentication is failing. We need to find the correct connection credentials.

## Quick Fix Options

### Option 1: Use Postgres.app (if installed)
Postgres.app typically uses your macOS username with no password:

```bash
# Update .env.local with:
DATABASE_URL=postgresql://$(whoami)@localhost:5432/savionray_content_lab
```

### Option 2: Reset PostgreSQL Password
If you have admin access to PostgreSQL:

```bash
# Connect as superuser (you may need to use sudo or find the correct user)
psql -h localhost -U postgres -d postgres

# Then run:
ALTER USER postgres WITH PASSWORD 'password123';
\q
```

### Option 3: Create New Database User
```bash
# Connect to PostgreSQL (find the correct way for your setup)
psql -h localhost -d postgres

# Create new user and database
CREATE USER savionray WITH PASSWORD 'password123';
CREATE DATABASE savionray_content_lab OWNER savionray;
GRANT ALL PRIVILEGES ON DATABASE savionray_content_lab TO savionray;
\q

# Update .env.local:
DATABASE_URL=postgresql://savionray:password123@localhost:5432/savionray_content_lab
```

### Option 4: Check Your PostgreSQL Setup
```bash
# Check which PostgreSQL is running
ps aux | grep postgres

# Check PostgreSQL version and location
which psql
psql --version

# Try connecting with different methods
psql -h localhost -d postgres
psql -h localhost -U $(whoami) -d postgres
psql -h localhost -U postgres -d postgres
```

## After Fixing Connection

Once you have the correct DATABASE_URL:

1. **Update .env.local:**
   ```bash
   # Edit .env.local and set the correct DATABASE_URL
   ```

2. **Run migrations:**
   ```bash
   npx prisma db push
   ```

3. **Seed database:**
   ```bash
   npm run seed
   ```

4. **Verify:**
   ```bash
   node verify-db-setup.js
   ```

## Test Login Credentials (after seeding)
- creative@savionray.com / password123
- client@savionray.com / password123
- admin@savionray.com / password123
- bisera@savionray.com / SavionRay2025!





