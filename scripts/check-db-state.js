const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkDatabaseState() {
  try {
    console.log('🔍 Checking database state...\n')

    // Check users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })
    console.log('👥 Users:')
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - ${user.role}`)
    })
    console.log()

    // Check ideas
    const ideas = await prisma.idea.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        createdBy: {
          select: {
            email: true
          }
        }
      }
    })
    console.log('💡 Ideas:')
    ideas.forEach(idea => {
      console.log(`  - "${idea.title}" - Status: ${idea.status} (by ${idea.createdBy.email})`)
    })
    console.log()

    // Check content drafts
    const drafts = await prisma.contentDraft.findMany({
      select: {
        id: true,
        status: true,
        contentType: true,
        createdBy: {
          select: {
            email: true
          }
        },
        idea: {
          select: {
            title: true,
            status: true
          }
        }
      }
    })
    console.log('📝 Content Drafts:')
    drafts.forEach(draft => {
      console.log(`  - "${draft.idea.title}" - Draft Status: ${draft.status}, Content Type: ${draft.contentType} (by ${draft.createdBy.email})`)
    })
    console.log()

    // Check specific queries
    console.log('🔍 Testing specific queries:')
    
    // Query for creative user
    const creativeUser = users.find(u => u.role === 'CREATIVE')
    if (creativeUser) {
      const creativeDrafts = await prisma.contentDraft.findMany({
        where: {
          createdById: creativeUser.id,
          status: {
            in: ['APPROVED', 'AWAITING_FEEDBACK']
          }
        }
      })
      console.log(`  - Creative user (${creativeUser.email}) has ${creativeDrafts.length} ready content drafts`)
    }

    // Query for all ready content
    const allReadyContent = await prisma.contentDraft.findMany({
      where: {
        status: {
          in: ['APPROVED', 'AWAITING_FEEDBACK']
        }
      }
    })
    console.log(`  - Total ready content drafts: ${allReadyContent.length}`)

    // Query for approved ideas with drafts
    const approvedIdeasWithDrafts = await prisma.idea.findMany({
      where: {
        status: 'APPROVED',
        contentDrafts: {
          some: {}
        }
      },
      include: {
        contentDrafts: {
          select: {
            status: true
          }
        }
      }
    })
    console.log(`  - Approved ideas with drafts: ${approvedIdeasWithDrafts.length}`)

  } catch (error) {
    console.error('Error checking database state:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabaseState() 