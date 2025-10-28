const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verifyFile() {
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

    console.log('📄 Document Details:')
    console.log(`   Name: ${document.originalName}`)
    console.log(`   Filename: ${document.filename}`)
    console.log(`   Content Type: ${document.contentType}`)
    console.log(`   Size: ${document.size} bytes`)
    console.log(`   Status: ${document.status}`)
    console.log(`   OpenAI File ID: ${document.openaiFileId}`)
    
    // Check if OpenAI file still exists
    const apiKey = process.env.OPENAI_API_KEY
    if (apiKey) {
      const { OpenAI } = require('openai')
      const openai = new OpenAI({ apiKey })
      
      try {
        const file = await openai.files.retrieve(document.openaiFileId)
        console.log('\n✅ OpenAI File Status:')
        console.log(`   File ID: ${file.id}`)
        console.log(`   Purpose: ${file.purpose}`)
        console.log(`   Filename: ${file.filename}`)
        console.log(`   Status: ${file.status}`)
        console.log(`   Bytes: ${file.bytes}`)
        console.log(`   Created: ${new Date(file.created_at * 1000).toISOString()}`)
      } catch (error) {
        console.error('❌ Error retrieving file from OpenAI:', error.message)
      }
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyFile()
