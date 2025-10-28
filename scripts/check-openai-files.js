const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function checkAndUploadFiles() {
  try {
    console.log('🔍 Checking for documents without OpenAI file IDs...\n')

    // Get all documents that don't have an OpenAI file ID
    const documentsWithoutOpenAI = await prisma.knowledgeDocument.findMany({
      where: {
        openaiFileId: null,
        status: 'PROCESSED'
      },
      include: {
        knowledgeBase: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    // Always show document status
    console.log(`Found ${documentsWithoutOpenAI.length} documents without OpenAI file IDs`)

    if (documentsWithoutOpenAI.length === 0) {
      console.log('✅ All documents already have OpenAI file IDs!')
    }

    console.log(`Found ${documentsWithoutOpenAI.length} documents without OpenAI file IDs:`)
    documentsWithoutOpenAI.forEach((doc, i) => {
      console.log(`${i + 1}. ${doc.originalName} (KB: ${doc.knowledgeBase.name})`)
    })

    console.log('\n❌ These documents need to be re-uploaded through the UI to get OpenAI file IDs.')
    console.log('The OpenAI Files API requires the actual file content to upload.')
    console.log('\n📝 To fix this:')
    console.log('1. Delete these documents in the UI')
    console.log('2. Re-upload them through the Knowledge Base interface')
    console.log('3. The new code will automatically upload them to OpenAI\n')

    // Show ALL documents with details
    const allDocuments = await prisma.knowledgeDocument.findMany({
      include: {
        knowledgeBase: {
          select: {
            name: true
          }
        }
      }
    })

    console.log('📊 All Documents Status:')
    allDocuments.forEach((doc, i) => {
      console.log(`\n${i + 1}. ${doc.originalName}`)
      console.log(`   Status: ${doc.status}`)
      console.log(`   OpenAI File ID: ${doc.openaiFileId || '❌ MISSING'}`)
      console.log(`   Knowledge Base: ${doc.knowledgeBase.name}`)
      console.log(`   Size: ${doc.size} bytes`)
    })

  } catch (error) {
    console.error('❌ Error checking documents:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the check
checkAndUploadFiles()
