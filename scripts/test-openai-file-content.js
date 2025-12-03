const { PrismaClient } = require('@prisma/client')
const { OpenAI } = require('openai')

const prisma = new PrismaClient()

async function testFileAccess() {
  try {
    const document = await prisma.knowledgeDocument.findFirst({
      where: {
        openaiFileId: 'file-KxZCNDK9rnYwtUCucApnP5'
      }
    })

    if (!document) {
      console.log('Document not found')
      return
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      console.log('OpenAI API key not found')
      return
    }

    const openai = new OpenAI({ apiKey })

    console.log('🔍 Testing OpenAI File Access...\n')

    // 1. Get file details
    const file = await openai.files.retrieve(document.openaiFileId)
    console.log('✅ File Retrieved:')
    console.log(`   ID: ${file.id}`)
    console.log(`   Status: ${file.status}`)
    console.log(`   Purpose: ${file.purpose}`)
    console.log(`   Filename: ${file.filename}`)
    console.log(`   Size: ${file.bytes} bytes`)
    console.log(`   Created: ${new Date(file.created_at * 1000).toISOString()}\n`)

    // 2. Try to read file content
    try {
      const fileContent = await openai.files.content(document.openaiFileId)
      console.log('✅ File Content Retrieved:')
      console.log(`   Type: ${fileContent.constructor.name}`)
      // If it's a Response, try to get text
      if (fileContent.constructor.name === 'Response') {
        const text = await fileContent.text()
        console.log(`   Preview: ${text.substring(0, 200)}...`)
      }
    } catch (error) {
      console.error('❌ Error reading file content:', error.message)
    }

    // 3. Try to use Assistants API to access the file
    try {
      console.log('\n🤖 Testing Assistants API with File Search...')
      
      // Create a test assistant with file search
      const assistant = await openai.beta.assistants.create({
        name: 'Test File Search',
        instructions: 'You are a helpful assistant that can access uploaded files.',
        model: 'gpt-4o-mini',
        tools: [{ type: 'file_search' }],
        tool_resources: {
          file_search: {
            vector_store_ids: []
          }
        }
      })

      console.log('✅ Test Assistant Created:', assistant.id)

      // Clean up
      await openai.beta.assistants.del(assistant.id)
      console.log('✅ Test Assistant Deleted\n')

    } catch (error) {
      console.error('❌ Error with Assistants API:', error.message)
      console.error('   Full error:', error)
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testFileAccess()




