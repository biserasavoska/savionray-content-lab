const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function listDrafts() {
  try {
    console.log('🔍 Listing all content drafts...')
    
    const drafts = await prisma.contentDraft.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { 
        Media: true,
        Idea: { select: { title: true } }
      }
    })
    
    console.log(`📊 Found ${drafts.length} content drafts:`)
    drafts.forEach((draft, index) => {
      console.log(`${index + 1}. ID: ${draft.id}`)
      console.log(`   Title: ${draft.Idea?.title || 'No title'}`)
      console.log(`   Status: ${draft.status}`)
      console.log(`   Organization: ${draft.organizationId}`)
      console.log(`   Media count: ${draft.Media.length}`)
      console.log(`   Created: ${draft.createdAt}`)
      console.log('---')
    })
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

listDrafts()
