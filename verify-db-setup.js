const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function verifySetup() {
  try {
    // Check users
    const users = await prisma.user.findMany({
      select: {
        email: true,
        name: true,
        role: true,
        password: true
      }
    })
    
    console.log(`\n✅ Found ${users.length} users in database:`)
    users.forEach(user => {
      const hasPassword = user.password ? '✅' : '❌'
      console.log(`  ${hasPassword} ${user.email} (${user.name}) - ${user.role}`)
    })
    
    if (users.length === 0) {
      console.log('\n⚠️  No users found! You need to run: npm run seed')
      process.exit(1)
    }
    
    // Check organizations
    const orgs = await prisma.organization.findMany({
      select: {
        id: true,
        name: true
      }
    })
    
    console.log(`\n✅ Found ${orgs.length} organizations:`)
    orgs.forEach(org => {
      console.log(`  - ${org.name} (${org.id})`)
    })
    
    console.log('\n✅ Database setup complete!')
    console.log('\n📋 Test login credentials:')
    console.log('  - creative@savionray.com / password123')
    console.log('  - client@savionray.com / password123')
    console.log('  - admin@savionray.com / password123')
    console.log('  - bisera@savionray.com / SavionRay2025!')
    
  } catch (error) {
    console.error('\n❌ Error verifying database:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

verifySetup()





