const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

// Production database connection
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function fixProductionLogin() {
  try {
    console.log('🚀 Starting production login fix...')
    console.log('=' * 50)
    
    // Step 1: Check and fix schema
    console.log('\n📋 Step 1: Checking database schema...')
    
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'User' 
      AND column_name = 'isSuperAdmin'
    `
    
    if (tableInfo.length === 0) {
      console.log('❌ isSuperAdmin column is missing. Adding it...')
      
      await prisma.$executeRaw`
        ALTER TABLE "User" 
        ADD COLUMN "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false
      `
      
      console.log('✅ isSuperAdmin column added successfully')
    } else {
      console.log('✅ isSuperAdmin column already exists')
    }
    
    // Step 2: Check and fix admin user
    console.log('\n👤 Step 2: Checking admin user...')
    
    const adminUser = await prisma.user.findFirst({
      where: {
        email: 'admin@savionray.com'
      }
    })
    
    if (!adminUser) {
      console.log('❌ Admin user not found. Creating one...')
      
      const hashedPassword = await bcrypt.hash('admin123', 12)
      
      const newAdmin = await prisma.user.create({
        data: {
          email: 'admin@savionray.com',
          name: 'Admin User',
          role: 'ADMIN',
          isSuperAdmin: true,
          password: hashedPassword
        }
      })
      
      console.log('✅ Admin user created successfully')
      console.log(`📧 Email: ${newAdmin.email}`)
      console.log('🔑 Password: admin123')
      
    } else {
      console.log('✅ Admin user found')
      console.log(`📧 Email: ${adminUser.email}`)
      console.log(`👤 Role: ${adminUser.role}`)
      console.log(`🔐 Has password: ${!!adminUser.password}`)
      console.log(`🔐 isSuperAdmin: ${adminUser.isSuperAdmin}`)
      
      // Update admin user to ensure proper settings
      console.log('🔧 Updating admin user settings...')
      const hashedPassword = await bcrypt.hash('admin123', 12)
      
      await prisma.user.update({
        where: { id: adminUser.id },
        data: { 
          password: hashedPassword,
          isSuperAdmin: true,
          role: 'ADMIN'
        }
      })
      
      console.log('✅ Admin user updated successfully')
      console.log('🔑 New password: admin123')
    }
    
    // Step 3: Verify everything works
    console.log('\n🔍 Step 3: Verifying setup...')
    
    const verifyUser = await prisma.user.findFirst({
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
    
    if (verifyUser) {
      console.log('✅ Admin user verification successful')
      console.log(`📧 Email: ${verifyUser.email}`)
      console.log(`👤 Name: ${verifyUser.name}`)
      console.log(`🎭 Role: ${verifyUser.role}`)
      console.log(`🔐 isSuperAdmin: ${verifyUser.isSuperAdmin}`)
      console.log(`🔑 Has password: ${!!verifyUser.password}`)
      
      // Test password verification
      const isValidPassword = await bcrypt.compare('admin123', verifyUser.password)
      console.log(`🔑 Password verification: ${isValidPassword ? '✅ Valid' : '❌ Invalid'}`)
    }
    
    // Step 4: Check other users
    console.log('\n👥 Step 4: Checking other users...')
    
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        isSuperAdmin: true
      }
    })
    
    console.log(`📊 Total users in database: ${allUsers.length}`)
    allUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.role}) - isSuperAdmin: ${user.isSuperAdmin}`)
    })
    
    console.log('\n' + '=' * 50)
    console.log('🎉 Production login fix completed successfully!')
    console.log('\n📝 Summary:')
    console.log('  - Database schema has been updated')
    console.log('  - Admin user has been created/updated')
    console.log('  - Login credentials: admin@savionray.com / admin123')
    console.log('\n⚠️  Please test the login in production and change the password after successful login.')
    
  } catch (error) {
    console.error('\n❌ Error fixing production login:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
if (require.main === module) {
  fixProductionLogin()
    .then(() => {
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n💥 Production login fix failed:', error)
      process.exit(1)
    })
}

module.exports = { fixProductionLogin } 