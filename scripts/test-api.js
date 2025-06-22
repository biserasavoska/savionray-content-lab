#!/usr/bin/env node

const axios = require('axios');

async function testAPI() {
  console.log('🧪 Testing API endpoints...\n');

  try {
    // Test 1: Check if server is running
    console.log('1️⃣ Testing server availability...');
    const homeResponse = await axios.get('http://localhost:3000');
    console.log('✅ Server is running');
    console.log(`   Status: ${homeResponse.status}`);
    console.log(`   Title: ${homeResponse.data.includes('Savion Ray Content Lab') ? 'Found' : 'Not found'}\n`);

    // Test 2: Test content generation API (should return unauthorized)
    console.log('2️⃣ Testing content generation API (unauthenticated)...');
    try {
      const contentResponse = await axios.post('http://localhost:3000/api/content/generate', {
        title: 'Test Content',
        description: 'This is a test',
        format: 'linkedin',
        model: 'gpt-3.5-turbo'
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
      console.log('❌ Should have returned unauthorized');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly returned unauthorized (401)');
      } else {
        console.log(`❌ Unexpected error: ${error.response?.status || error.message}`);
      }
    }

    console.log('\n🎉 API tests completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Open http://localhost:3000 in your browser');
    console.log('2. Sign in with: creative@savionray.com');
    console.log('3. Test the content generation feature');
    console.log('4. Clear browser cache if you see old errors');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAPI(); 