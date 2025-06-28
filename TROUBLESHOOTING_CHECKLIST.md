# Savion Ray Local Development Troubleshooting Checklist

## 🚨 **Content Review Issues (Most Common)**
If the content review page is not working or showing "No content to review":

```sh
# Run the comprehensive content review fix
./scripts/fix-content-review.sh
```

This script will:
- Reset and reseed the database with proper content
- Create approved ideas with content drafts
- Fix any enum mismatches
- Start the development server

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

## 6. **Content Review Specific Issues**
If content review shows "No content to review":

1. **Check if you're logged in as the right user:**
   - Creative users see their own drafts
   - Client users see all drafts for approved ideas

2. **Verify database has approved ideas:**
   ```sh
   npx prisma studio
   ```
   Look for ideas with status "APPROVED"

3. **Check content drafts exist:**
   Look for ContentDraft records with status "AWAITING_FEEDBACK"

4. **Run the fix script:**
   ```sh
   ./scripts/fix-content-review.sh
   ```

---

# Automated Troubleshooting Scripts

## Quick Fix Script
```sh
#!/bin/bash
# scripts/dev-troubleshoot.sh

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

## Content Review Fix Script
```sh
#!/bin/bash
# scripts/fix-content-review.sh

# Comprehensive fix for content review issues
# Includes database reset, reseeding, and verification
# See the full script in scripts/fix-content-review.sh
```

Make them executable:
```sh
chmod +x scripts/dev-troubleshoot.sh
chmod +x scripts/fix-content-review.sh
```

Run them when needed:
```sh
./scripts/dev-troubleshoot.sh    # General issues
./scripts/fix-content-review.sh  # Content review specific
```

---

## 🎯 **Expected Content Review Behavior**

After running the fix script, you should see:

1. **As Creative User (creative@savionray.com):**
   - 3 content drafts for approved ideas
   - Drafts in "AWAITING_FEEDBACK" status
   - Ability to edit and submit drafts

2. **As Client User (client@savionray.com):**
   - Same 3 content drafts
   - Ability to approve or request revisions
   - "Approve" and "Request Revision" buttons

3. **Content Drafts Include:**
   - Summer Marketing Campaign (Social Media Post)
   - Industry Insights Newsletter (Newsletter)
   - Product Launch Blog Series (Blog Post)

---

**If you still have issues, copy any error messages and ask for help!** 