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
  
  # Try to run database migrations (but don't fail if they don't work)
  echo "--- Attempting database migrations ---"
  npx prisma migrate deploy || echo "--- Migration failed, continuing anyway ---"
  
  # Try to seed database (but don't fail if it doesn't work)
  echo "--- Attempting database seeding ---"
  npx prisma db seed || echo "--- Seeding failed, continuing anyway ---"
  
  echo "--- Starting Next.js on port $PORT ---"
  exec npx next start -p $PORT
else
  echo "--- Running in local environment ---"
  echo "--- Starting Next.js on port $PORT ---"
  exec npx next start -p ${PORT:-3000}
fi 