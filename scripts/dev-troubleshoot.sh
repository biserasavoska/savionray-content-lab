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