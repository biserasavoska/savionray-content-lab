#!/usr/bin/env node

const requiredVars = [
  'DATABASE_URL',
  'NEXTAUTH_URL', 
  'NEXTAUTH_SECRET',
  'OPENAI_API_KEY',
  'LINKEDIN_CLIENT_ID',
  'LINKEDIN_CLIENT_SECRET'
];

console.log('🔍 Verifying Railway environment variables...\n');

let allPresent = true;
const missingVars = [];

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`❌ ${varName}: MISSING`);
    missingVars.push(varName);
    allPresent = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allPresent) {
  console.log('✅ All required environment variables are present!');
  console.log('🚀 Ready for deployment');
} else {
  console.log('❌ Missing environment variables:');
  missingVars.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  console.log('\n📝 Please add these variables in Railway dashboard:');
  console.log('   1. Go to your Railway project');
  console.log('   2. Click on your service');
  console.log('   3. Go to Variables tab');
  console.log('   4. Add the missing variables');
  process.exit(1);
} 