#!/usr/bin/env node

/**
 * Rollbar Integration Test Script
 * This script tests both client and server-side Rollbar integration
 */

const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:3000';

// Test server-side API endpoints
async function testServerEndpoints() {
  console.log('🧪 Testing Server-Side Rollbar Integration...\n');
  
  const endpoints = [
    { type: 'info', expected: 'Server info sent to Rollbar' },
    { type: 'warning', expected: 'Server warning sent to Rollbar' },
    { type: 'error', expected: 'Server error reported to Rollbar' }
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${BASE_URL}/api/test-rollbar?type=${endpoint.type}`);
      const data = await response.json();
      
      if (data.success && data.message === endpoint.expected) {
        console.log(`✅ ${endpoint.type.toUpperCase()}: ${data.message}`);
      } else {
        console.log(`❌ ${endpoint.type.toUpperCase()}: Unexpected response`, data);
      }
    } catch (error) {
      console.log(`❌ ${endpoint.type.toUpperCase()}: Error testing endpoint`, error.message);
    }
  }
}

// Test client-side page loading
async function testClientPage() {
  console.log('\n🧪 Testing Client-Side Rollbar Integration...\n');
  
  try {
    const response = await fetch(`${BASE_URL}/test-rollbar`);
    const html = await response.text();
    
    if (html.includes('Rollbar Integration Test')) {
      console.log('✅ Test page loads successfully');
    } else {
      console.log('❌ Test page content not found');
    }
    
    if (html.includes('Test Client Error')) {
      console.log('✅ Client-side test buttons are present');
    } else {
      console.log('❌ Client-side test buttons not found');
    }
    
    if (html.includes('Test Server Error')) {
      console.log('✅ Server-side test buttons are present');
    } else {
      console.log('❌ Server-side test buttons not found');
    }
    
  } catch (error) {
    console.log('❌ Error loading test page:', error.message);
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Rollbar Integration Tests...\n');
  console.log('📋 Make sure your development server is running on http://localhost:3000\n');
  
  await testServerEndpoints();
  await testClientPage();
  
  console.log('\n🎉 Integration Tests Complete!');
  console.log('\n📝 Next Steps:');
  console.log('1. Open http://localhost:3000/test-rollbar in your browser');
  console.log('2. Click the test buttons to trigger client-side errors');
  console.log('3. Check your Rollbar dashboard at https://rollbar.com');
  console.log('4. Look for errors from project: SavionRayContentLab');
  console.log('\n🔗 Your Rollbar Dashboard: https://rollbar.com');
  console.log('📊 Project Name: SavionRayContentLab');
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests, testServerEndpoints, testClientPage };
