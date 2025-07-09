const { PrismaClient } = require('@prisma/client')

// Production database connection
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function testProductionSchema() {
  try {
    console.log('🔍 Testing production database schema...')
    
    if (!process.env.DATABASE_URL) {
      console.log('❌ DATABASE_URL not set. Please set it first:')
      console.log('   export DATABASE_URL="your-production-database-url"')
      return
    }
    
    // Test connection
    console.log('🔌 Testing database connection...')
    await prisma.$connect()
    console.log('✅ Database connection successful')
    
    // Check if isSuperAdmin column exists
    console.log('📋 Checking User table schema...')
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'User' 
      ORDER BY ordinal_position
    `
    
    console.log('📊 User table columns:')
    tableInfo.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}) - nullable: ${col.is_nullable} - default: ${col.column_default}`)
    })
    
    const hasIsSuperAdmin = tableInfo.some(col => col.column_name === 'isSuperAdmin')
    console.log(`\n🔍 isSuperAdmin column exists: ${hasIsSuperAdmin ? '✅ Yes' : '❌ No'}`)
    
    // Check admin user
    console.log('\n👤 Checking admin user...')
    const adminUser = await prisma.user.findFirst({
      where: {
        email: 'admin@savionray.com'
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isSuperAdmin: true,
        password: true
      }
    })
    
    if (adminUser) {
      console.log('✅ Admin user found:')
      console.log(`  - Email: ${adminUser.email}`)
      console.log(`  - Name: ${adminUser.name}`)
      console.log(`  - Role: ${adminUser.role}`)
      console.log(`  - isSuperAdmin: ${adminUser.isSuperAdmin}`)
      console.log(`  - Has password: ${!!adminUser.password}`)
    } else {
      console.log('❌ Admin user not found')
    }
    
    // Check all users
    console.log('\n👥 All users in database:')
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        isSuperAdmin: true
      }
    })
    
    console.log(`📊 Total users: ${allUsers.length}`)
    allUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.role}) - isSuperAdmin: ${user.isSuperAdmin}`)
    })
    
    console.log('\n' + '=' * 50)
    console.log('📝 Summary:')
    if (!hasIsSuperAdmin) {
      console.log('❌ Missing isSuperAdmin column - need to run fix script')
    } else {
      console.log('✅ isSuperAdmin column exists')
    }
    
    if (!adminUser) {
      console.log('❌ Admin user missing - need to run fix script')
    } else if (!adminUser.password) {
      console.log('❌ Admin user has no password - need to run fix script')
    } else {
      console.log('✅ Admin user exists with password')
    }
    
  } catch (error) {
    console.error('❌ Error testing production schema:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
if (require.main === module) {
  testProductionSchema()
    .then(() => {
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Test failed:', error)
      process.exit(1)
    })
}

module.exports = { testProductionSchema } 