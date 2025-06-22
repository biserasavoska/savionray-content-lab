#!/usr/bin/env node

const requiredVars = [
  'DATABASE_URL',
  'NEXTAUTH_URL', 
  'NEXTAUTH_SECRET',
  'OPENAI_API_KEY',
  'LINKEDIN_CLIENT_ID',
  'LINKEDIN_CLIENT_SECRET'
];

console.log('🔍 Checking Railway environment variables...\n');

let allPresent = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`❌ ${varName}: MISSING`);
    allPresent = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allPresent) {
  console.log('✅ All required environment variables are present!');
  console.log('🚀 Ready for deployment');
} else {
  console.log('❌ Some environment variables are missing');
  console.log('📝 Please add the missing variables in Railway dashboard');
  process.exit(1);
} 