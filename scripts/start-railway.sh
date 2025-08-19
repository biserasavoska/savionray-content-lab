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
  
  # Check if database already has data
  echo "--- Checking database state ---"
  DB_HAS_DATA=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | grep -o '[0-9]*' | tail -1 || echo "0")
  
  if [ "$DB_HAS_DATA" -gt 0 ]; then
    echo "--- Database has existing data, using db push instead of migrations ---"
    npx prisma db push --accept-data-loss || echo "--- Database push failed, continuing anyway ---"
    
    echo "--- Skipping seeding (database already has data) ---"
  else
    echo "--- Database is empty, running migrations and seeding ---"
    npx prisma migrate deploy || echo "--- Migration failed, continuing anyway ---"
    
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