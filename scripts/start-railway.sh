#!/bin/bash

# Log everything to see what's happening
echo "--- Running start-railway.sh ---"
echo "--- Checking environment variables ---"
printenv
echo "--- PORT from env is: [$PORT] ---"

if [ -z "$PORT" ]; then
  echo "PORT variable is not set. Defaulting to 3000 and expecting failure."
  PORT=3000
fi

echo "--- Starting Next.js on port $PORT ---"
npx next start -p $PORT
echo "--- Next.js process exited ---" 