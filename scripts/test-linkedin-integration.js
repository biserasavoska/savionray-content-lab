#!/usr/bin/env node

const axios = require('axios');

async function testLinkedInIntegration() {
  console.log('🧪 Testing LinkedIn Integration Phase 2...\n');

  try {
    // Test 1: Check if server is running
    console.log('1️⃣ Testing server availability...');
    const homeResponse = await axios.get('http://localhost:3000');
    console.log('✅ Server is running');
    console.log(`   Status: ${homeResponse.status}\n`);

    // Test 2: Test LinkedIn status endpoint (should return unauthorized without session)
    console.log('2️⃣ Testing LinkedIn status endpoint (unauthenticated)...');
    try {
      const statusResponse = await axios.get('http://localhost:3000/api/auth/linkedin/status');
      console.log('❌ Should have returned unauthorized');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ LinkedIn status endpoint correctly requires authentication (401)');
      } else {
        console.log(`❌ Unexpected error: ${error.response?.status || error.message}`);
      }
    }

    // Test 3: Test LinkedIn connect endpoint (should redirect)
    console.log('\n3️⃣ Testing LinkedIn connect endpoint...');
    try {
      const connectResponse = await axios.get('http://localhost:3000/api/auth/linkedin/connect', {
        maxRedirects: 0,
        validateStatus: () => false
      });
      console.log('❌ Should have redirected or returned unauthorized');
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 302 || error.response?.status === 307) {
        console.log('✅ LinkedIn connect endpoint correctly requires authentication or redirects');
      } else {
        console.log(`❌ Unexpected error: ${error.response?.status || error.message}`);
      }
    }

    // Test 4: Test publish-social endpoint (should return unauthorized)
    console.log('\n4️⃣ Testing publish-social endpoint (unauthenticated)...');
    try {
      const publishResponse = await axios.post('http://localhost:3000/api/drafts/test-id/publish-social', {
        platforms: ['linkedin']
      });
      console.log('❌ Should have returned unauthorized');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Publish-social endpoint correctly requires authentication (401)');
      } else {
        console.log(`❌ Unexpected error: ${error.response?.status || error.message}`);
      }
    }

    console.log('\n🎉 LinkedIn integration tests completed!');
    console.log('\n📝 Next steps for manual testing:');
    console.log('1. Open http://localhost:3000 in your browser');
    console.log('2. Sign in with: creative@savionray.com');
    console.log('3. Go to Profile page and connect LinkedIn account');
    console.log('4. Create a content draft and approve it');
    console.log('5. Try publishing to LinkedIn from the approved content list');
    console.log('6. Check the LinkedIn status endpoint for connection health');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testLinkedInIntegration();
