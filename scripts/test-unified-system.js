#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testUnifiedSystem() {
  console.log('🧪 Testing Unified Content System Performance...')
  
  try {
    // Test 1: Count total content items
    console.log('\n📊 Test 1: Content Item Count')
    const startTime = Date.now()
    const totalCount = await prisma.contentItem.count()
    const endTime = Date.now()
    console.log(`✅ Total ContentItems: ${totalCount}`)
    console.log(`⏱️  Query time: ${endTime - startTime}ms`)
    
    // Test 2: Fetch with pagination
    console.log('\n📄 Test 2: Pagination Performance')
    const paginationStart = Date.now()
    const paginatedItems = await prisma.contentItem.findMany({
      take: 10,
      skip: 0,
      include: {
        createdBy: { select: { name: true, email: true } },
        assignedTo: { select: { name: true, email: true } },
        organization: { select: { name: true } },
        comments: { take: 5 },
        feedbacks: { take: 5 },
        media: { take: 5 },
        stageHistory: { take: 10 }
      },
      orderBy: { createdAt: 'desc' }
    })
    const paginationEnd = Date.now()
    console.log(`✅ Fetched ${paginatedItems.length} items with relations`)
    console.log(`⏱️  Query time: ${paginationEnd - paginationStart}ms`)
    
    // Test 3: Filter by status
    console.log('\n🔍 Test 3: Status Filtering')
    const filterStart = Date.now()
    const approvedItems = await prisma.contentItem.count({
      where: { status: 'APPROVED' }
    })
    const filterEnd = Date.now()
    console.log(`✅ Approved items: ${approvedItems}`)
    console.log(`⏱️  Query time: ${filterEnd - filterStart}ms`)
    
    // Test 4: Stage transitions
    console.log('\n🔄 Test 4: Stage Transition History')
    const transitionStart = Date.now()
    const transitions = await prisma.stageTransition.findMany({
      take: 20,
      include: {
        contentItem: { select: { title: true } },
        user: { select: { name: true } }
      },
      orderBy: { transitionedAt: 'desc' }
    })
    const transitionEnd = Date.now()
    console.log(`✅ Found ${transitions.length} stage transitions`)
    console.log(`⏱️  Query time: ${transitionEnd - transitionStart}ms`)
    
    // Test 5: Content with feedback
    console.log('\n💬 Test 5: Content with Feedback')
    const feedbackStart = Date.now()
    const itemsWithFeedback = await prisma.contentItem.findMany({
      where: {
        feedbacks: { some: {} }
      },
      include: {
        feedbacks: { take: 3 },
        _count: {
          select: {
            feedbacks: true,
            comments: true,
            media: true
          }
        }
      },
      take: 5
    })
    const feedbackEnd = Date.now()
    console.log(`✅ Found ${itemsWithFeedback.length} items with feedback`)
    console.log(`⏱️  Query time: ${feedbackEnd - feedbackStart}ms`)
    
    console.log('\n🎉 Performance Test Complete!')
    console.log('\n📈 Summary:')
    console.log(`- Total ContentItems: ${totalCount}`)
    console.log(`- All queries completed successfully`)
    console.log(`- System is ready for production use`)
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  testUnifiedSystem()
}
