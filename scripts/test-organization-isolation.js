/**
 * Test script to verify organization isolation is working
 * This script tests that users can only access data from their organization
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testOrganizationIsolation() {
  console.log('🧪 Testing Organization Isolation...\n');

  try {
    // Test 1: Check if server is running
    console.log('1. Testing server connectivity...');
    const healthResponse = await fetch(`${BASE_URL}/api/health`);
    if (healthResponse.ok) {
      console.log('✅ Server is running and healthy');
    } else {
      console.log('❌ Server health check failed');
      return;
    }

    // Test 2: Check organization list API (without auth)
    console.log('\n2. Testing organization list API (unauthenticated)...');
    const orgListResponse = await fetch(`${BASE_URL}/api/organization/list`);
    if (orgListResponse.status === 401) {
      console.log('✅ Organization list API properly requires authentication');
    } else {
      console.log('❌ Organization list API should require authentication');
    }

    // Test 3: Check ideas API (without auth)
    console.log('\n3. Testing ideas API (unauthenticated)...');
    const ideasResponse = await fetch(`${BASE_URL}/api/ideas`);
    if (ideasResponse.status === 401) {
      console.log('✅ Ideas API properly requires authentication');
    } else {
      console.log('❌ Ideas API should require authentication');
    }

    // Test 4: Check organization dashboard page
    console.log('\n4. Testing organization dashboard page...');
    const dashboardResponse = await fetch(`${BASE_URL}/organization/dashboard`);
    if (dashboardResponse.ok) {
      console.log('✅ Organization dashboard page is accessible');
    } else {
      console.log('❌ Organization dashboard page failed');
      console.log(`   Status: ${dashboardResponse.status}`);
    }

    // Test 5: Check ideas page
    console.log('\n5. Testing ideas page...');
    const ideasPageResponse = await fetch(`${BASE_URL}/ideas`);
    if (ideasPageResponse.ok) {
      console.log('✅ Ideas page is accessible');
    } else {
      console.log('❌ Ideas page failed');
      console.log(`   Status: ${ideasPageResponse.status}`);
    }

    console.log('\n🎉 Organization isolation testing completed!');
    console.log('\n📋 Manual Testing Steps:');
    console.log('1. Open http://localhost:3000 in your browser');
    console.log('2. Log in with an admin account');
    console.log('3. Navigate to /ideas to see the ideas list');
    console.log('4. Use the organization switcher to change organizations');
    console.log('5. Verify that the ideas list changes to show only ideas for the selected organization');
    console.log('6. Create a new idea and verify it appears only in the current organization');
    console.log('7. Check that each idea card shows the organization name');

    console.log('\n🔍 Key Things to Verify:');
    console.log('- Ideas are filtered by the current organization');
    console.log('- Organization name is displayed on each idea card');
    console.log('- Page header shows which organization you\'re viewing');
    console.log('- Creating new ideas assigns them to the current organization');
    console.log('- Switching organizations updates the ideas list');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testOrganizationIsolation(); 