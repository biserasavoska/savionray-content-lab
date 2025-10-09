#!/usr/bin/env node

/**
 * Railway-specific LinkedIn account cleanup
 * Run this on Railway to fix LinkedIn accounts with incorrect providerAccountId
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function cleanupLinkedInAccountsOnRailway() {
  try {
    console.log('🚂 Railway LinkedIn Account Cleanup')
    console.log('=====================================')
    
    // Find all LinkedIn accounts
    const linkedinAccounts = await prisma.account.findMany({
      where: {
        provider: 'linkedin'
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    })

    console.log(`Found ${linkedinAccounts.length} LinkedIn accounts`)

    // Check if any accounts have internal user IDs as providerAccountId
    const problematicAccounts = linkedinAccounts.filter(account => 
      account.providerAccountId === account.userId
    )

    if (problematicAccounts.length > 0) {
      console.log(`\n⚠️  Found ${problematicAccounts.length} problematic accounts:`)
      
      for (const account of problematicAccounts) {
        console.log(`- ${account.user.email}: providerAccountId = ${account.providerAccountId} (should be LinkedIn member ID)`)
      }

      console.log('\n🗑️  Deleting problematic accounts...')
      
      const deleteResult = await prisma.account.deleteMany({
        where: {
          provider: 'linkedin',
          providerAccountId: {
            in: problematicAccounts.map(acc => acc.providerAccountId)
          }
        }
      })

      console.log(`✅ Deleted ${deleteResult.count} problematic LinkedIn accounts`)
      console.log('\n🔄 Next steps:')
      console.log('1. Users should go to /profile page')
      console.log('2. Click "Connect LinkedIn" to reconnect')
      console.log('3. This will create accounts with correct LinkedIn member IDs')
      
    } else {
      console.log('✅ All LinkedIn accounts have correct providerAccountId!')
    }

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

cleanupLinkedInAccountsOnRailway()
