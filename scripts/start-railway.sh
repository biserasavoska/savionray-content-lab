#!/bin/bash

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
    
    # Try to clean up orphaned data first
    echo "--- Attempting to clean up orphaned data ---"
    npx prisma db execute --stdin <<< "
      -- Delete ContentDeliveryPlan records with invalid organizationId
      DELETE FROM \"ContentDeliveryPlan\" 
      WHERE \"organizationId\" NOT IN (SELECT id FROM \"Organization\");
      
      -- Delete ContentDeliveryItem records with invalid planId
      DELETE FROM \"ContentDeliveryItem\" 
      WHERE \"planId\" NOT IN (SELECT id FROM \"ContentDeliveryPlan\");
    " 2>/dev/null || echo "--- Data cleanup failed, continuing anyway ---"
    
    # Now try the database push with force flag
    echo "--- Attempting database push with force flag ---"
    npx prisma db push --force-reset || echo "--- Database push failed, continuing anyway ---"
    
    echo "--- Skipping seeding (database already has data) ---"
  else
    echo "--- Database is empty or migrations succeeded, attempting seeding ---"
    echo "--- Attempting database seeding ---"
    npx prisma db seed || echo "--- Seeding failed, continuing anyway ---"
  fi
  
  echo "--- Starting Next.js on port $PORT ---"
  exec npx next start -p $PORT
else
  echo "--- Running in local environment ---"
  echo "--- Starting Next.js on port $PORT ---"
  exec npx next start -p ${PORT:-3000}
fi 