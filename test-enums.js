const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testEnums() {
  console.log('IdeaStatus values:', Object.keys(prisma.ideaStatus || {}))
  console.log('DraftStatus values:', Object.keys(prisma.draftStatus || {}))
  
  // Try to access the enums directly
  try {
    console.log('IdeaStatus.PENDING:', prisma.ideaStatus?.PENDING)
    console.log('DraftStatus.DRAFT:', prisma.draftStatus?.DRAFT)
  } catch (error) {
    console.log('Error accessing enums:', error.message)
  }
}

testEnums()
  .then(() => prisma.$disconnect())
  .catch(console.error) 