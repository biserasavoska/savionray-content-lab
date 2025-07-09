#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Production database connection string
const PRODUCTION_DATABASE_URL = 'postgresql://postgres:GcJJcUnmSCAjMJySweloMmdZVtwxpbNq@nozomi.proxy.rlwy.net:47902/railway';

async function resetAdminPassword() {
  console.log('🔐 Starting admin password reset for production...');
  
  // Create Prisma client with production database
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: PRODUCTION_DATABASE_URL,
      },
    },
  });

  try {
    // Test database connection
    console.log('📡 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Find the admin user (without isSuperAdmin field)
    console.log('🔍 Looking for admin user...');
    const adminUser = await prisma.user.findUnique({
      where: {
        email: 'admin@savionray.com',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
      },
    });

    if (!adminUser) {
      console.log('❌ Admin user not found in production database');
      console.log('Creating admin user...');
      
      // Create admin user if it doesn't exist (without isSuperAdmin)
      const hashedPassword = await bcrypt.hash('admin123', 12);
      const newAdminUser = await prisma.user.create({
        data: {
          email: 'admin@savionray.com',
          name: 'Admin User',
          role: 'ADMIN',
          password: hashedPassword,
        },
      });
      
      console.log('✅ Admin user created successfully');
      console.log('📧 Email: admin@savionray.com');
      console.log('🔑 Password: admin123');
      console.log('⚠️  Please change this password after first login!');
      
      return;
    }

    console.log('✅ Admin user found');
    console.log(`📧 Email: ${adminUser.email}`);
    console.log(`👤 Name: ${adminUser.name}`);
    console.log(`🔑 Role: ${adminUser.role}`);

    // Generate new password hash
    const newPassword = 'admin123'; // You can change this default password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update the admin user's password
    console.log('🔄 Updating admin password...');
    await prisma.user.update({
      where: {
        email: 'admin@savionray.com',
      },
      data: {
        password: hashedPassword,
      },
    });

    console.log('✅ Admin password updated successfully!');
    console.log('📧 Email: admin@savionray.com');
    console.log('🔑 New Password: admin123');
    console.log('⚠️  Please change this password after login for security!');

  } catch (error) {
    console.error('❌ Error resetting admin password:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Database connection closed');
  }
}

// Run the script
resetAdminPassword()
  .then(() => {
    console.log('🎉 Password reset completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  }); 