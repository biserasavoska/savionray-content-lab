# Savion Ray Local Development Troubleshooting Checklist

## 1. **Check for Port Conflicts**
If you see messages like `Port 3000 is in use`, run:

```sh
kill -9 $(lsof -ti :3000) 2>/dev/null
kill -9 $(lsof -ti :3001) 2>/dev/null
kill -9 $(lsof -ti :3002) 2>/dev/null
```

## 2. **Check Database Connection**
- Make sure your database is running (e.g., `docker-compose up -d`)
- Check your `.env` file for the correct `DATABASE_URL`.

## 3. **Reset and Reseed the Database**
If login or data is broken, run:

```sh
npx prisma db push --force-reset
npx prisma db seed
```

## 4. **Restart the Dev Server**
```sh
npm run dev
```

## 5. **Login with Demo Accounts**
- creative@savionray.com / password123
- client@savionray.com / password123
- admin@savionray.com / password123
- bisera@savionray.com / SavionRay2025!

---

# Automated Troubleshooting Script

Create a file called `scripts/dev-troubleshoot.sh` with the following content:

```sh
#!/bin/bash

# Kill lingering dev servers
kill -9 $(lsof -ti :3000) 2>/dev/null
kill -9 $(lsof -ti :3001) 2>/dev/null
kill -9 $(lsof -ti :3002) 2>/dev/null

# Start database (if using Docker)
docker-compose up -d

# Reset and reseed database
npx prisma db push --force-reset
npx prisma db seed

# Start dev server
npm run dev
```

Make it executable:
```sh
chmod +x scripts/dev-troubleshoot.sh
```

Run it any time you have local issues:
```sh
./scripts/dev-troubleshoot.sh
```

---

**If you still have issues, copy any error messages and ask for help!** 