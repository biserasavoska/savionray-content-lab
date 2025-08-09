// Simple Node.js script to test GPT-5 integration directly
// Run with: node test-gpt5-direct.js

const https = require('https');

const testData = JSON.stringify({
  testType: 'model-availability'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/test-gpt5',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': testData.length
  }
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('Response:', data);
    try {
      const parsed = JSON.parse(data);
      console.log('Parsed Response:', JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log('Could not parse JSON response');
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e);
});

req.write(testData);
req.end();

console.log('Testing GPT-5 API endpoint...');
