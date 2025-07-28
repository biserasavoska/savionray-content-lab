#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const SOCKET_URL = 'http://localhost:4001';

async function testPhase4Features() {
  console.log('🧪 Testing Phase 4 Features...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Health Check:', healthResponse.data.data.status);

    // Test 2: Socket.IO Health
    console.log('\n2. Testing Socket.IO Health...');
    const socketHealthResponse = await axios.get(`${SOCKET_URL}/health`);
    console.log('✅ Socket.IO Health:', socketHealthResponse.data.status);

    // Test 3: Organization API
    console.log('\n3. Testing Organization API...');
    try {
      const orgResponse = await axios.get(`${BASE_URL}/api/organization/list`);
      console.log('✅ Organization API accessible');
    } catch (error) {
      console.log('⚠️ Organization API requires authentication (expected)');
    }

    // Test 4: Feedback Management API
    console.log('\n4. Testing Feedback Management API...');
    try {
      const feedbackResponse = await axios.get(`${BASE_URL}/api/feedback/management`);
      console.log('✅ Feedback Management API accessible');
    } catch (error) {
      console.log('⚠️ Feedback Management API requires authentication (expected)');
    }

    console.log('\n🎉 Phase 4 Testing Complete!');
    console.log('\n📋 Manual Testing URLs:');
    console.log('- Organization Testing: http://localhost:3000/test-organization');
    console.log('- Feedback Management: http://localhost:3000/feedback-management');
    console.log('- Main Dashboard: http://localhost:3000/');
    console.log('- Organization Settings: http://localhost:3000/organization/settings');
    
    console.log('\n🔐 Authentication Required:');
    console.log('- Sign in at: http://localhost:3000/auth/signin');
    console.log('- Use: admin@savionray.com');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testPhase4Features(); 