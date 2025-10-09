#!/usr/bin/env node

const axios = require('axios');

async function testLinkedInConnectFlow() {
  console.log('🧪 Testing LinkedIn Connect Flow...\n');
  
  try {
    // Test 1: Check if connect endpoint is accessible
    console.log('1️⃣ Testing connect endpoint...');
    const connectResponse = await axios.get('http://localhost:3000/api/auth/linkedin/connect', {
      maxRedirects: 0,
      validateStatus: () => false
    });
    
    console.log(`   Status: ${connectResponse.status}`);
    console.log(`   Location: ${connectResponse.headers.location || 'No redirect'}`);
    
    if (connectResponse.status === 307 || connectResponse.status === 302) {
      console.log('   ✅ Connect endpoint redirects correctly');
      
      // Parse the LinkedIn authorization URL
      const authUrl = new URL(connectResponse.headers.location);
      console.log('\n2️⃣ LinkedIn Authorization URL Analysis:');
      console.log(`   • Client ID: ${authUrl.searchParams.get('client_id')}`);
      console.log(`   • Redirect URI: ${authUrl.searchParams.get('redirect_uri')}`);
      console.log(`   • Scope: ${authUrl.searchParams.get('scope')}`);
      console.log(`   • Response Type: ${authUrl.searchParams.get('response_type')}`);
      
      // Check if scope includes w_member_social
      const scope = authUrl.searchParams.get('scope') || '';
      const hasPostingScope = scope.includes('w_member_social');
      console.log(`   • Has Posting Scope: ${hasPostingScope ? '✅ YES' : '❌ NO'}`);
      
      if (!hasPostingScope) {
        console.log('\n⚠️  MISSING POSTING SCOPE!');
        console.log('   Your LinkedIn app needs the "Share on LinkedIn" product enabled.');
        console.log('   Go to LinkedIn Developer Console → Your App → Products');
        console.log('   Enable "Share on LinkedIn" to get w_member_social scope.');
      }
      
    } else {
      console.log('   ❌ Unexpected response from connect endpoint');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  
  console.log('\n📝 Next Steps:');
  console.log('1. Go to LinkedIn Developer Console');
  console.log('2. Check your app has "Share on LinkedIn" product enabled');
  console.log('3. Verify redirect URI is exactly: http://localhost:3000/api/auth/linkedin/callback');
  console.log('4. Try connecting again from the Profile page');
}

testLinkedInConnectFlow();
