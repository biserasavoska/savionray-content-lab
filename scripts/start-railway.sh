#!/bin/bash

# Railway startup script - Updated: $(date)
# Log everything to see what's happening
echo "--- Running start-railway.sh ---"
echo "--- Checking environment variables ---"

# Check if we're in Railway
if [ -n "$RAILWAY_ENVIRONMENT" ]; then
  echo "--- Running in Railway environment ---"
  
  # Set default port if not provided
  if [ -z "$PORT" ]; then
    echo "PORT variable is not set. Defaulting to 3000."
    PORT=3000
  fi
  
  echo "--- PORT from env is: [$PORT] ---"
  
  # ✅ IMPROVED: Check if database already has data BEFORE attempting migrations
  echo "--- Checking if database has existing data ---"
  
  # Check for existing ideas and delivery plans (more reliable than user count)
  IDEA_COUNT=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) as count FROM \"Idea\";" 2>/dev/null | grep -E '[0-9]+' | tail -1 | tr -d ' ' || echo "0")
  PLAN_COUNT=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) as count FROM \"ContentDeliveryPlan\";" 2>/dev/null | grep -E '[0-9]+' | tail -1 | tr -d ' ' || echo "0")
  
  # Ensure counts are valid numbers
  if [[ ! "$IDEA_COUNT" =~ ^[0-9]+$ ]]; then
    echo "--- Invalid idea count detected: '$IDEA_COUNT', defaulting to 0 ---"
    IDEA_COUNT=0
  fi
  
  if [[ ! "$PLAN_COUNT" =~ ^[0-9]+$ ]]; then
    echo "--- Invalid plan count detected: '$PLAN_COUNT', defaulting to 0 ---"
    PLAN_COUNT=0
  fi
  
  echo "--- Found $IDEA_COUNT ideas and $PLAN_COUNT delivery plans ---"
  
  # Run migrations
  echo "--- Running database migrations ---"
  npx prisma migrate deploy || echo "--- Migrations failed, continuing anyway ---"
  
  # Only seed if database is truly empty
  if [ "$IDEA_COUNT" -eq 0 ] && [ "$PLAN_COUNT" -eq 0 ]; then
    echo "--- Database is empty, running seed command ---"
    npx prisma db seed || echo "--- Seeding failed, continuing anyway ---"
  else
    echo "--- Database has existing data ($IDEA_COUNT ideas, $PLAN_COUNT plans), skipping seeding ---"
  fi
  
  # Clean up problematic LinkedIn accounts
  echo "--- Cleaning up LinkedIn accounts with incorrect providerAccountId ---"
  npm run railway-cleanup-linkedin || echo "--- LinkedIn cleanup failed, continuing anyway ---"
  
  echo "--- Starting Next.js on port $PORT ---"
  exec npx next start -p $PORT
else
  echo "--- Running in local environment ---"
  echo "--- Starting Next.js on port $PORT ---"
  exec npx next start -p ${PORT:-3000}
fi 