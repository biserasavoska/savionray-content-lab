const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testContentQuery() {
  try {
    console.log('🔍 Testing Content Review Query...\n')

    // Get the creative user
    const creativeUser = await prisma.user.findFirst({
      where: { role: 'CREATIVE' }
    })

    if (!creativeUser) {
      console.log('❌ No creative user found')
      return
    }

    console.log(`👤 Creative user: ${creativeUser.email} (ID: ${creativeUser.id})`)

    // Test the exact query from Content Review page
    const drafts = await prisma.contentDraft.findMany({
      where: {
        createdById: creativeUser.id,
        idea: {
          status: 'APPROVED'
        },
        status: {
          in: ['DRAFT', 'AWAITING_FEEDBACK', 'AWAITING_REVISION', 'APPROVED', 'REJECTED']
        }
      },
      include: {
        idea: {
          include: {
            createdBy: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        createdBy: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    console.log(`\n📊 Query Results:`)
    console.log(`Found ${drafts.length} drafts for creative user`)

    if (drafts.length > 0) {
      drafts.forEach((draft, index) => {
        console.log(`\n${index + 1}. Draft ID: ${draft.id}`)
        console.log(`   Idea: "${draft.idea.title}"`)
        console.log(`   Idea Status: ${draft.idea.status}`)
        console.log(`   Draft Status: ${draft.status}`)
        console.log(`   Content Type: ${draft.contentType}`)
        console.log(`   Created By: ${draft.createdBy.email}`)
      })
    }

    // Test without user filter
    console.log('\n🔍 Testing without user filter...')
    const allDrafts = await prisma.contentDraft.findMany({
      where: {
        idea: {
          status: 'APPROVED'
        },
        status: {
          in: ['DRAFT', 'AWAITING_FEEDBACK', 'AWAITING_REVISION', 'APPROVED', 'REJECTED']
        }
      }
    })
    console.log(`Found ${allDrafts.length} total drafts for approved ideas`)

    // Test just the status filter
    console.log('\n🔍 Testing just status filter...')
    const statusDrafts = await prisma.contentDraft.findMany({
      where: {
        status: {
          in: ['DRAFT', 'AWAITING_FEEDBACK', 'AWAITING_REVISION', 'APPROVED', 'REJECTED']
        }
      }
    })
    console.log(`Found ${statusDrafts.length} total drafts with any of the target statuses`)

    // Test just AWAITING_FEEDBACK
    console.log('\n🔍 Testing just AWAITING_FEEDBACK...')
    const awaitingFeedbackDrafts = await prisma.contentDraft.findMany({
      where: {
        status: 'AWAITING_FEEDBACK'
      }
    })
    console.log(`Found ${awaitingFeedbackDrafts.length} drafts with AWAITING_FEEDBACK status`)

  } catch (error) {
    console.error('Error testing content query:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testContentQuery() 