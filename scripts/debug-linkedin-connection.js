#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugLinkedInConnection() {
  console.log('🔍 Debugging LinkedIn Connection Issues...\n');
  
  // Check if there are any LinkedIn accounts (even failed ones)
  const accounts = await prisma.account.findMany({
    where: {
      provider: 'linkedin'
    }
  });
  
  console.log('📋 All LinkedIn Accounts in Database:');
  if (accounts.length === 0) {
    console.log('  ❌ No LinkedIn accounts found');
  } else {
    accounts.forEach((account, index) => {
      console.log(`\n  Account ${index + 1}:`);
      console.log(`    • ID: ${account.id}`);
      console.log(`    • User ID: ${account.userId}`);
      console.log(`    • Provider Account ID: ${account.providerAccountId}`);
      console.log(`    • Has Access Token: ${!!account.access_token}`);
      console.log(`    • Token Type: ${account.token_type}`);
      console.log(`    • Scope: ${account.scope}`);
      console.log(`    • Expires At: ${account.expires_at ? new Date(account.expires_at * 1000).toLocaleString() : 'Not set'}`);
    });
  }
  
  console.log('\n🔧 LinkedIn App Configuration Check:');
  console.log('Please verify these settings in your LinkedIn Developer App:');
  console.log('');
  console.log('1. 📱 App Status:');
  console.log('   • Is your app in "Development" or "Live" mode?');
  console.log('   • Development mode tokens expire in 24 hours');
  console.log('   • Live mode requires LinkedIn review');
  console.log('');
  console.log('2. 🔗 Redirect URLs:');
  console.log('   • Should include: http://localhost:3000/api/auth/linkedin/callback');
  console.log('   • Make sure there are no trailing slashes');
  console.log('');
  console.log('3. 🔐 OAuth 2.0 Scopes:');
  console.log('   • Required: openid, profile, email');
  console.log('   • Required: w_member_social (for posting)');
  console.log('   • Check that all scopes are enabled');
  console.log('');
  console.log('4. 📊 Products:');
  console.log('   • Must have: "Sign In with LinkedIn using OpenID Connect"');
  console.log('   • Must have: "Share on LinkedIn" (for w_member_social)');
  console.log('');
  
  console.log('🧪 Test Commands:');
  console.log('');
  console.log('1. Test the connect endpoint:');
  console.log('   curl -I http://localhost:3000/api/auth/linkedin/connect');
  console.log('');
  console.log('2. Check environment variables:');
  console.log('   echo "LINKEDIN_CLIENT_ID: $LINKEDIN_CLIENT_ID"');
  console.log('   echo "LINKEDIN_CLIENT_SECRET: $LINKEDIN_CLIENT_SECRET"');
  console.log('   echo "NEXTAUTH_URL: $NEXTAUTH_URL"');
  console.log('');
  
  await prisma.$disconnect();
}

debugLinkedInConnection().catch(console.error);
