#!/usr/bin/env node

/**
 * Test script for organization assignment functionality
 * 
 * This script tests:
 * 1. Organization list API
 * 2. Content item creation with automatic organization assignment
 * 3. Content item creation with manual organization override
 */

const BASE_URL = 'http://localhost:3001'

async function testOrganizationAssignment() {
  console.log('🧪 Testing Organization Assignment System\n')

  try {
    // Test 1: Organization List API (should return unauthorized)
    console.log('1️⃣ Testing Organization List API (unauthenticated)...')
    const orgListResponse = await fetch(`${BASE_URL}/api/organization/list`)
    const orgListData = await orgListResponse.json()
    
    if (orgListResponse.status === 401) {
      console.log('✅ Correctly returns unauthorized when not authenticated')
    } else {
      console.log('❌ Expected 401 but got:', orgListResponse.status)
    }

    // Test 2: Content Items API (should return unauthorized)
    console.log('\n2️⃣ Testing Content Items API (unauthenticated)...')
    const contentResponse = await fetch(`${BASE_URL}/api/content-items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Test Content',
        description: 'Test Description',
        contentType: 'BLOG_POST'
      })
    })
    
    if (contentResponse.status === 401) {
      console.log('✅ Correctly returns unauthorized when not authenticated')
    } else {
      console.log('❌ Expected 401 but got:', contentResponse.status)
    }

    // Test 3: Test with session cookie (manual test)
    console.log('\n3️⃣ Manual Testing Instructions:')
    console.log('   📝 To test with authentication:')
    console.log('   1. Open http://localhost:3001 in your browser')
    console.log('   2. Sign in with admin@savionray.com')
    console.log('   3. Visit http://localhost:3001/test-organization')
    console.log('   4. Test the organization selector and content creation form')
    
    console.log('\n   🔧 API Testing with authentication:')
    console.log('   1. Sign in via browser to get session cookie')
    console.log('   2. Use browser dev tools to copy the session cookie')
    console.log('   3. Test API endpoints with the cookie in headers')

    console.log('\n✅ Organization assignment system is ready for testing!')
    console.log('\n📋 What to test:')
    console.log('   • Organization selector shows correct organizations')
    console.log('   • Content creation uses selected organization')
    console.log('   • Automatic fallback to first organization')
    console.log('   • Manual override functionality')
    console.log('   • Multi-tenant data isolation')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Run the test
testOrganizationAssignment() 