#!/usr/bin/env node

/**
 * Railway Environment Variables Checker
 * 
 * This script helps verify that all required environment variables
 * are properly configured in Railway.
 */

const crypto = require('crypto');

console.log('🔍 Railway Environment Variables Checker\n');

// Required environment variables
const requiredVars = [
  'DATABASE_URL',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'OPENAI_API_KEY'
];

// Optional environment variables
const optionalVars = [
  'LINKEDIN_CLIENT_ID',
  'LINKEDIN_CLIENT_SECRET',
  'UNSPLASH_ACCESS_KEY'
];

console.log('📋 Required Environment Variables:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${varName.includes('SECRET') || varName.includes('KEY') ? '***' + value.slice(-4) : value}`);
  } else {
    console.log(`❌ ${varName}: MISSING`);
  }
});

console.log('\n📋 Optional Environment Variables:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${varName.includes('SECRET') || varName.includes('KEY') ? '***' + value.slice(-4) : value}`);
  } else {
    console.log(`⚠️  ${varName}: Not set (optional)`);
  }
});

console.log('\n🔧 Railway Configuration Steps:');

if (!process.env.NEXTAUTH_SECRET) {
  const secret = crypto.randomBytes(32).toString('hex');
  console.log('\n🔑 Generate a new NEXTAUTH_SECRET:');
  console.log(`NEXTAUTH_SECRET=${secret}`);
  console.log('\n📝 Add this to your Railway environment variables');
}

if (!process.env.NEXTAUTH_URL) {
  console.log('\n🌐 Set NEXTAUTH_URL in Railway:');
  console.log('NEXTAUTH_URL=https://savionray-content-lab-production.up.railway.app');
}

console.log('\n📖 Railway Environment Variables Guide:');
console.log('1. Go to your Railway project dashboard');
console.log('2. Click on your app service');
console.log('3. Go to "Variables" tab');
console.log('4. Add/update the missing variables above');
console.log('5. Redeploy your application');

console.log('\n🚀 After updating variables:');
console.log('1. Railway will automatically redeploy');
console.log('2. Check the deployment logs for any errors');
console.log('3. Test the application at: https://savionray-content-lab-production.up.railway.app');

console.log('\n👥 Team Testing Users:');
console.log('Email: creative@savionray.com (Creative role)');
console.log('Email: client@savionray.com (Client role)');
console.log('Email: admin@savionray.com (Admin role)');
console.log('Password: Any password will work for these test accounts'); 