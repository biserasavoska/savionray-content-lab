#!/usr/bin/env node

/**
 * Monitoring Environment Variables Verification Script
 * This script checks if all required environment variables are properly configured
 */

console.log('🔍 Verifying Monitoring Environment Variables...\n');

// Define required environment variables
const requiredVars = {
  rollbar: {
    server: 'ROLLBAR_SERVER_ACCESS_TOKEN',
    client: 'NEXT_PUBLIC_ROLLBAR_CLIENT_ACCESS_TOKEN',
    version: 'NEXT_PUBLIC_APP_VERSION'
  },
  checkly: {
    accountId: 'CHECKLY_ACCOUNT_ID',
    apiKey: 'CHECKLY_API_KEY'
  },
  betterstack: {
    sourceToken: 'BETTERSTACK_SOURCE_TOKEN',
    apiUrl: 'BETTERSTACK_API_URL'
  },
  app: {
    nodeEnv: 'NODE_ENV'
  }
};

// Expected values (for verification)
const expectedValues = {
  ROLLBAR_SERVER_ACCESS_TOKEN: '04c4928a2f754ab0bdc091733c7a8e26',
  NEXT_PUBLIC_ROLLBAR_CLIENT_ACCESS_TOKEN: '5edea99b9891476885963e63bbbe691c',
  CHECKLY_ACCOUNT_ID: '7ff4cdcc-25b1-48a0-83c3-233d4a86b1d9',
  CHECKLY_API_KEY: 'cu_2af377dd442447eb90a9187b4d4613b2',
  BETTERSTACK_SOURCE_TOKEN: 'KFgJg3R6QBRYaMtxU97zTJk7',
  BETTERSTACK_API_URL: 'https://logs.betterstack.com'
};

let allGood = true;

// Check Rollbar variables
console.log('🔴 ROLLBAR Configuration:');
const rollbarServer = process.env.ROLLBAR_SERVER_ACCESS_TOKEN;
const rollbarClient = process.env.NEXT_PUBLIC_ROLLBAR_CLIENT_ACCESS_TOKEN;
const appVersion = process.env.NEXT_PUBLIC_APP_VERSION;

if (rollbarServer) {
  const isCorrect = rollbarServer === expectedValues.ROLLBAR_SERVER_ACCESS_TOKEN;
  console.log(`  ✅ ROLLBAR_SERVER_ACCESS_TOKEN: ${isCorrect ? '✅ Correct' : '❌ Incorrect'}`);
  if (!isCorrect) allGood = false;
} else {
  console.log('  ❌ ROLLBAR_SERVER_ACCESS_TOKEN: Missing');
  allGood = false;
}

if (rollbarClient) {
  const isCorrect = rollbarClient === expectedValues.NEXT_PUBLIC_ROLLBAR_CLIENT_ACCESS_TOKEN;
  console.log(`  ✅ NEXT_PUBLIC_ROLLBAR_CLIENT_ACCESS_TOKEN: ${isCorrect ? '✅ Correct' : '❌ Incorrect'}`);
  if (!isCorrect) allGood = false;
} else {
  console.log('  ❌ NEXT_PUBLIC_ROLLBAR_CLIENT_ACCESS_TOKEN: Missing');
  allGood = false;
}

if (appVersion) {
  console.log(`  ✅ NEXT_PUBLIC_APP_VERSION: ${appVersion}`);
} else {
  console.log('  ⚠️  NEXT_PUBLIC_APP_VERSION: Missing (optional)');
}

// Check Checkly variables
console.log('\n🟢 CHECKLY Configuration:');
const checklyAccountId = process.env.CHECKLY_ACCOUNT_ID;
const checklyApiKey = process.env.CHECKLY_API_KEY;

if (checklyAccountId) {
  const isCorrect = checklyAccountId === expectedValues.CHECKLY_ACCOUNT_ID;
  console.log(`  ✅ CHECKLY_ACCOUNT_ID: ${isCorrect ? '✅ Correct' : '❌ Incorrect'}`);
  if (!isCorrect) allGood = false;
} else {
  console.log('  ❌ CHECKLY_ACCOUNT_ID: Missing');
  allGood = false;
}

if (checklyApiKey) {
  const isCorrect = checklyApiKey === expectedValues.CHECKLY_API_KEY;
  console.log(`  ✅ CHECKLY_API_KEY: ${isCorrect ? '✅ Correct' : '❌ Incorrect'}`);
  if (!isCorrect) allGood = false;
} else {
  console.log('  ❌ CHECKLY_API_KEY: Missing');
  allGood = false;
}

// Check Better Stack variables
console.log('\n🔵 BETTER STACK Configuration:');
const betterStackToken = process.env.BETTERSTACK_SOURCE_TOKEN;
const betterStackUrl = process.env.BETTERSTACK_API_URL;

if (betterStackToken) {
  const isCorrect = betterStackToken === expectedValues.BETTERSTACK_SOURCE_TOKEN;
  console.log(`  ✅ BETTERSTACK_SOURCE_TOKEN: ${isCorrect ? '✅ Correct' : '❌ Incorrect'}`);
  if (!isCorrect) allGood = false;
} else {
  console.log('  ❌ BETTERSTACK_SOURCE_TOKEN: Missing');
  allGood = false;
}

if (betterStackUrl) {
  console.log(`  ✅ BETTERSTACK_API_URL: ${betterStackUrl}`);
} else {
  console.log('  ⚠️  BETTERSTACK_API_URL: Missing (will use default)');
}

// Check Node environment
console.log('\n🌍 APPLICATION Configuration:');
const nodeEnv = process.env.NODE_ENV;
if (nodeEnv) {
  console.log(`  ✅ NODE_ENV: ${nodeEnv}`);
  if (!['development', 'staging', 'production'].includes(nodeEnv)) {
    console.log('  ⚠️  Warning: NODE_ENV should be development, staging, or production');
  }
} else {
  console.log('  ❌ NODE_ENV: Missing');
  allGood = false;
}

// Summary
console.log('\n📊 SUMMARY:');
if (allGood) {
  console.log('🎉 All monitoring environment variables are properly configured!');
  console.log('\n✅ Your monitoring stack is ready:');
  console.log('  🔴 Rollbar - Error tracking and alerting');
  console.log('  🟢 Checkly - Uptime monitoring and synthetic testing');
  console.log('  🔵 Better Stack - Log management and observability');
} else {
  console.log('❌ Some environment variables are missing or incorrect.');
  console.log('\n📋 Please check the MONITORING_ENV_VARIABLES_CHECKLIST.md file');
  console.log('   and ensure all required variables are set in your environment.');
}

console.log('\n🚀 Next steps:');
console.log('  1. Deploy to staging/production with these variables');
console.log('  2. Test monitoring endpoints');
console.log('  3. Verify logs are appearing in all dashboards');

process.exit(allGood ? 0 : 1);


