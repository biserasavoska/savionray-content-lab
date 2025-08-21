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
  
  # Check if database already has data by trying to run migrations first
  echo "--- Attempting database migrations ---"
  if npx prisma migrate deploy 2>&1 | grep -q "P3005"; then
    echo "--- Database has existing data (P3005 error detected), using db push instead ---"
    
    # Try to clean up orphaned data first (non-destructive)
    echo "--- Attempting to clean up orphaned data (non-destructive) ---"
    npx prisma db execute --stdin <<< "
      -- Delete ContentDeliveryPlan records with invalid organizationId
      DELETE FROM \"ContentDeliveryPlan\" 
      WHERE \"organizationId\" NOT IN (SELECT id FROM \"Organization\");
      
      -- Delete ContentDeliveryItem records with invalid planId
      DELETE FROM \"ContentDeliveryItem\" 
      WHERE \"planId\" NOT IN (SELECT id FROM \"ContentDeliveryPlan\");
    " 2>/dev/null || echo "--- Data cleanup failed, continuing anyway ---"
    
    # Now try the database push WITHOUT force-reset to preserve existing data
    echo "--- Attempting database push (preserving existing data) ---"
    npx prisma db push || echo "--- Database push failed, continuing anyway ---"
    
    echo "--- Skipping seeding (database already has data) ---"
  else
    echo "--- Database is empty or migrations succeeded, attempting seeding ---"
    echo "--- Attempting database seeding ---"
    npx prisma db seed || echo "--- Seeding failed, continuing anyway ---"
  fi
  
  # Check if database is empty after all operations
  echo "--- Checking if database needs seeding ---"
  
  # More robust user count extraction
  USER_COUNT=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) as count FROM \"User\";" 2>/dev/null | grep -E '[0-9]+' | tail -1 | tr -d ' ' || echo "0")
  
  # Ensure USER_COUNT is a valid number
  if [[ ! "$USER_COUNT" =~ ^[0-9]+$ ]]; then
    echo "--- Invalid user count detected: '$USER_COUNT', defaulting to 0 ---"
    USER_COUNT=0
  fi
  
  if [ "$USER_COUNT" -eq 0 ]; then
    echo "--- Database is empty, running seed command ---"
    npx prisma db seed || echo "--- Seeding failed, continuing anyway ---"
  else
    echo "--- Database has data (${USER_COUNT} users), skipping seeding ---"
  fi
  
  echo "--- Starting Next.js on port $PORT ---"
  exec npx next start -p $PORT
else
  echo "--- Running in local environment ---"
  echo "--- Starting Next.js on port $PORT ---"
  exec npx next start -p ${PORT:-3000}
fi 