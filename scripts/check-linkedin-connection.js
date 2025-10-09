#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkConnection() {
  console.log('🔍 Checking LinkedIn Connection...\n');
  
  const account = await prisma.account.findFirst({
    where: {
      userId: 'cmeeue9oe0002rqizpkubeclu',
      provider: 'linkedin'
    }
  });
  
  if (!account) {
    console.log('❌ No LinkedIn connection found');
    console.log('\n📝 Next steps:');
    console.log('1. Go to http://localhost:3000/profile');
    console.log('2. Click "Connect LinkedIn"');
    console.log('3. Authorize the app on LinkedIn');
    await prisma.$disconnect();
    return;
  }
  
  console.log('✅ LinkedIn Connection Found!\n');
  console.log('📋 Connection Details:');
  console.log('  • Provider Account ID:', account.providerAccountId);
  console.log('  • Has Access Token:', !!account.access_token);
  console.log('  • Token Type:', account.token_type);
  console.log('  • Scope:', account.scope);
  
  if (account.expires_at) {
    const expiryDate = new Date(account.expires_at * 1000);
    const now = new Date();
    const isExpired = expiryDate < now;
    
    console.log('  • Expires At:', expiryDate.toLocaleString());
    console.log('  • Is Expired:', isExpired ? '❌ YES' : '✅ NO');
    
    if (isExpired) {
      console.log('\n⚠️  Token is expired! Please reconnect LinkedIn.');
    }
  }
  
  // Check if scope includes w_member_social
  const hasPostingPermission = account.scope?.includes('w_member_social');
  console.log('  • Can Post to LinkedIn:', hasPostingPermission ? '✅ YES' : '❌ NO');
  
  if (!hasPostingPermission) {
    console.log('\n⚠️  Missing w_member_social permission!');
    console.log('   Please reconnect and ensure posting permission is granted.');
  }
  
  console.log('\n🎯 Ready to test publishing!');
  
  await prisma.$disconnect();
}

checkConnection().catch(console.error);

