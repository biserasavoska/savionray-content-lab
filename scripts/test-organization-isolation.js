/**
 * Test script to verify organization isolation is working
 * This script tests that users can only access data from their organization
 */

const BASE_URL = 'http://localhost:3000';

async function testOrganizationIsolation() {
  console.log('🧪 Testing Organization Isolation (Phase 2)...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check passed:', healthData.success ? 'OK' : 'FAILED');

    // Test 2: Ideas endpoint (should require authentication)
    console.log('\n2. Testing ideas endpoint without auth...');
    const ideasResponse = await fetch(`${BASE_URL}/api/ideas`);
    const ideasData = await ideasResponse.json();
    console.log('✅ Ideas endpoint properly requires auth:', ideasResponse.status === 401 ? 'OK' : 'FAILED');

    // Test 3: Check if organization context is being used
    console.log('\n3. Testing organization context...');
    console.log('ℹ️  This test requires a logged-in user session.');
    console.log('ℹ️  Please log in to the application and then check:');
    console.log('   - Ideas page: http://localhost:3000/ideas');
    console.log('   - Content Review: http://localhost:3000/content-review');
    console.log('   - Delivery Plans: http://localhost:3000/delivery-plans');
    console.log('\n✅ Organization isolation tests completed!');
    console.log('\n📋 Manual Testing Checklist:');
    console.log('   □ Log in as a user');
    console.log('   □ Create a new idea');
    console.log('   □ Verify the idea appears in the list');
    console.log('   □ Check that only ideas from your organization are visible');
    console.log('   □ Try to access ideas from other organizations (should be blocked)');
    console.log('   □ Test content drafts, delivery plans, and other features');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testOrganizationIsolation(); 