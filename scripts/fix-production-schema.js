const { PrismaClient } = require('@prisma/client')

// Production database connection
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function fixProductionSchema() {
  try {
    console.log('🔍 Checking production database schema...')
    
    // Check if isSuperAdmin column exists
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'User' 
      AND column_name = 'isSuperAdmin'
    `
    
    if (tableInfo.length === 0) {
      console.log('❌ isSuperAdmin column is missing. Adding it...')
      
      // Add the isSuperAdmin column with default value false
      await prisma.$executeRaw`
        ALTER TABLE "User" 
        ADD COLUMN "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false
      `
      
      console.log('✅ isSuperAdmin column added successfully')
      
      // Update existing admin users to have isSuperAdmin = true
      const adminUsers = await prisma.user.findMany({
        where: {
          role: 'ADMIN'
        }
      })
      
      if (adminUsers.length > 0) {
        console.log(`🔧 Updating ${adminUsers.length} admin users to have isSuperAdmin = true...`)
        
        for (const user of adminUsers) {
          await prisma.user.update({
            where: { id: user.id },
            data: { isSuperAdmin: true }
          })
        }
        
        console.log('✅ Admin users updated successfully')
      }
      
    } else {
      console.log('✅ isSuperAdmin column already exists')
    }
    
    // Verify the schema
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        isSuperAdmin: true
      },
      take: 5
    })
    
    console.log('📊 Current users in database:')
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.role}) - isSuperAdmin: ${user.isSuperAdmin}`)
    })
    
  } catch (error) {
    console.error('❌ Error fixing production schema:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
if (require.main === module) {
  fixProductionSchema()
    .then(() => {
      console.log('🎉 Production schema fix completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Production schema fix failed:', error)
      process.exit(1)
    })
}

module.exports = { fixProductionSchema } 