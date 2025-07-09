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

async function resetProductionAdmin() {
  try {
    console.log('🔍 Checking production admin user...')
    
    // Find the admin user
    const adminUser = await prisma.user.findFirst({
      where: {
        email: 'admin@savionray.com'
      }
    })
    
    if (!adminUser) {
      console.log('❌ Admin user not found. Creating one...')
      
      // Create admin user
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
      
      // Reset password
      console.log('🔧 Resetting admin password...')
      const hashedPassword = await bcrypt.hash('admin123', 12)
      
      await prisma.user.update({
        where: { id: adminUser.id },
        data: { 
          password: hashedPassword,
          isSuperAdmin: true // Ensure this is set
        }
      })
      
      console.log('✅ Admin password reset successfully')
      console.log('🔑 New password: admin123')
    }
    
    // Verify the user can be found with the new password
    console.log('🔍 Verifying admin user...')
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
    }
    
  } catch (error) {
    console.error('❌ Error resetting production admin:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
if (require.main === module) {
  resetProductionAdmin()
    .then(() => {
      console.log('🎉 Production admin reset completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Production admin reset failed:', error)
      process.exit(1)
    })
}

module.exports = { resetProductionAdmin } 