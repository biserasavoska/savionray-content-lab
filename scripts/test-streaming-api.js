#!/usr/bin/env node

/**
 * Test script for OpenAI streaming implementation
 * This script tests the new real OpenAI streaming API
 */

const testStreamingAPI = async () => {
  const baseUrl = process.env.TEST_URL || 'http://localhost:3000'
  
  console.log('🧪 Testing OpenAI Streaming API...')
  console.log(`📍 Testing against: ${baseUrl}`)
  
  try {
    // Test 1: Basic streaming request
    console.log('\n📝 Test 1: Basic streaming request')
    
    const response = await fetch(`${baseUrl}/api/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: In real testing, you'd need proper authentication
        // 'Authorization': 'Bearer your-test-token'
      },
      body: JSON.stringify({
        message: 'Hello, can you help me with content creation?',
        model: 'gpt-5-mini'
      })
    })
    
    if (!response.ok) {
      console.log(`❌ API request failed: ${response.status} ${response.statusText}`)
      console.log('ℹ️  This is expected without proper authentication')
      return
    }
    
    console.log('✅ API request successful')
    
    // Test 2: Check if response is streaming
    console.log('\n📝 Test 2: Check streaming response')
    
    const reader = response.body?.getReader()
    if (!reader) {
      console.log('❌ No response body reader available')
      return
    }
    
    console.log('✅ Response body reader available')
    
    // Test 3: Read streaming chunks
    console.log('\n📝 Test 3: Reading streaming chunks')
    
    const decoder = new TextDecoder()
    let chunkCount = 0
    let totalContent = ''
    
    try {
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) {
          console.log('✅ Streaming completed')
          break
        }
        
        chunkCount++
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.content) {
                totalContent += data.content
                console.log(`📦 Chunk ${chunkCount}: "${data.content.substring(0, 50)}${data.content.length > 50 ? '...' : ''}"`)
              }
              if (data.done) {
                console.log('✅ Received completion signal')
              }
              if (data.error) {
                console.log(`❌ Received error: ${data.error}`)
              }
            } catch (e) {
              console.log(`⚠️  Failed to parse chunk: ${line}`)
            }
          }
        }
      }
      
      console.log(`\n📊 Streaming Results:`)
      console.log(`   - Total chunks received: ${chunkCount}`)
      console.log(`   - Total content length: ${totalContent.length} characters`)
      console.log(`   - Content preview: "${totalContent.substring(0, 100)}${totalContent.length > 100 ? '...' : ''}"`)
      
      if (chunkCount > 1) {
        console.log('✅ Real streaming detected (multiple chunks)')
      } else {
        console.log('⚠️  Only one chunk received - may not be streaming')
      }
      
    } catch (error) {
      console.log(`❌ Error reading stream: ${error.message}`)
    } finally {
      reader.releaseLock()
    }
    
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`)
  }
}

// Run the test
testStreamingAPI().then(() => {
  console.log('\n🎉 Streaming API test completed')
  console.log('\n📋 Next steps:')
  console.log('   1. Test with proper authentication')
  console.log('   2. Test with conversation context')
  console.log('   3. Test error handling')
  console.log('   4. Test different models')
})
