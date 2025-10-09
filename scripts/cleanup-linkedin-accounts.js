#!/usr/bin/env node

/**
 * Cleanup script to remove LinkedIn accounts with incorrect providerAccountId
 * This fixes accounts that were created with internal user ID instead of LinkedIn member ID
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function cleanupLinkedInAccounts() {
  try {
    console.log('🔍 Checking LinkedIn accounts...')
    
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

    console.log(`Found ${linkedinAccounts.length} LinkedIn accounts:`)
    
    for (const account of linkedinAccounts) {
      console.log(`- User: ${account.user.email} (${account.user.name})`)
      console.log(`  Account ID: ${account.id}`)
      console.log(`  Provider Account ID: ${account.providerAccountId}`)
      console.log(`  Has Access Token: ${!!account.access_token}`)
      console.log(`  Scope: ${account.scope}`)
      console.log(`  Expires At: ${account.expires_at}`)
      console.log('')
    }

    // Check if any accounts have internal user IDs as providerAccountId
    const problematicAccounts = linkedinAccounts.filter(account => 
      account.providerAccountId === account.userId
    )

    if (problematicAccounts.length > 0) {
      console.log(`⚠️  Found ${problematicAccounts.length} problematic LinkedIn accounts:`)
      
      for (const account of problematicAccounts) {
        console.log(`- ${account.user.email}: providerAccountId is internal user ID (${account.providerAccountId})`)
      }

      console.log('\n🗑️  Deleting problematic LinkedIn accounts...')
      
      const deleteResult = await prisma.account.deleteMany({
        where: {
          provider: 'linkedin',
          providerAccountId: {
            in: problematicAccounts.map(acc => acc.providerAccountId)
          }
        }
      })

      console.log(`✅ Deleted ${deleteResult.count} problematic LinkedIn accounts`)
      console.log('🔄 Users will need to reconnect their LinkedIn accounts')
      
    } else {
      console.log('✅ All LinkedIn accounts look correct!')
    }

  } catch (error) {
    console.error('❌ Error cleaning up LinkedIn accounts:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

cleanupLinkedInAccounts()
