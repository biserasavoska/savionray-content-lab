#!/bin/bash

# Set the port from Railway environment variable
export PORT=${PORT:-3000}

echo "Starting SavionRay Content Lab on port $PORT"

# Start the Next.js application with explicit port
exec npx next start -p $PORT 