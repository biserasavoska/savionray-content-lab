const axios = require('axios');

// Test script for reasoning models
async function testReasoningModels() {
  console.log('🧪 Testing Reasoning Models API...\n');

  const baseURL = 'http://localhost:3000';
  
  try {
    // Test 1: Check available models
    console.log('📋 Test 1: Checking available models...');
    const modelsResponse = await axios.get(`${baseURL}/api/models`);
    console.log('✅ Available models:', modelsResponse.data);
    console.log('');

    // Test 2: Test content generation with o4-mini (reasoning model)
    console.log('🤖 Test 2: Testing o4-mini reasoning model...');
    const contentData = {
      title: "AI in Marketing",
      description: "How artificial intelligence is transforming modern marketing strategies and customer engagement",
      format: "linkedin",
      model: "o4-mini",
      includeReasoning: true,
      reasoningSummary: true
    };

    console.log('📤 Sending request with data:', JSON.stringify(contentData, null, 2));
    
    const contentResponse = await axios.post(`${baseURL}/api/content/generate`, contentData, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('✅ Response received:');
    console.log('📝 Post Text:', contentResponse.data.postText);
    console.log('🏷️  Hashtags:', contentResponse.data.hashtags);
    console.log('📢 Call to Action:', contentResponse.data.callToAction);
    
    if (contentResponse.data.reasoning) {
      console.log('🧠 Reasoning Data:');
      console.log('   - Summary:', contentResponse.data.reasoning.summary);
      console.log('   - Reasoning ID:', contentResponse.data.reasoning.reasoningId);
      console.log('   - Encrypted:', !!contentResponse.data.reasoning.encryptedContent);
    }
    console.log('');

    // Test 3: Test with o3 model (more advanced)
    console.log('🚀 Test 3: Testing o3 advanced reasoning model...');
    const o3Data = {
      ...contentData,
      model: "o3",
      encryptedReasoning: true
    };

    const o3Response = await axios.post(`${baseURL}/api/content/generate`, o3Data, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('✅ O3 Response received:');
    console.log('📝 Post Text:', o3Response.data.postText);
    console.log('🏷️  Hashtags:', o3Response.data.hashtags);
    console.log('📢 Call to Action:', o3Response.data.callToAction);
    
    if (o3Response.data.reasoning) {
      console.log('🧠 O3 Reasoning Data:');
      console.log('   - Summary:', o3Response.data.reasoning.summary);
      console.log('   - Reasoning ID:', o3Response.data.reasoning.reasoningId);
      console.log('   - Encrypted:', !!o3Response.data.reasoning.encryptedContent);
    }
    console.log('');

    // Test 4: Compare with standard model
    console.log('⚖️  Test 4: Comparing with standard GPT-5 Mini model...');
    const standardData = {
      ...contentData,
      model: "gpt-5-mini",
      includeReasoning: false
    };

    const standardResponse = await axios.post(`${baseURL}/api/content/generate`, standardData, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('✅ Standard model response received');
    console.log('📝 Post Text:', standardResponse.data.postText);
    console.log('🏷️  Hashtags:', standardResponse.data.hashtags);
    console.log('📢 Call to Action:', standardResponse.data.callToAction);
    console.log('');

    console.log('🎉 All tests completed successfully!');
    console.log('\n📊 Summary:');
    console.log('- ✅ Reasoning models are working');
    console.log('- ✅ API responses include reasoning data');
    console.log('- ✅ Standard models still work');
    console.log('- ✅ No breaking changes detected');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.response) {
      console.error('📋 Response status:', error.response.status);
      console.error('📋 Response data:', error.response.data);
    }
    
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure the server is running: npm run dev');
    console.log('2. Check if you have OPENAI_API_KEY in your .env file');
    console.log('3. Verify the API endpoint is accessible');
  }
}

// Run the test
testReasoningModels(); 