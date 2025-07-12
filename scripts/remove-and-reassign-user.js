const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function removeAndReassignUser() {
  try {
    console.log('🔍 Finding Sara\'s current organization assignments...')
    
    // Find Sara's user record
    const sara = await prisma.user.findUnique({
      where: { email: 'sara.zambelli@efaa.com' },
      include: {
        organizationUsers: {
          include: {
            organization: true
          }
        }
      }
    })
    
    if (!sara) {
      console.log('❌ Sara not found in database')
      return
    }
    
    console.log(`✅ Found Sara: ${sara.name} (${sara.email})`)
    console.log(`📊 Current organization count: ${sara.organizationUsers.length}`)
    
    // Remove existing organization assignments
    if (sara.organizationUsers.length > 0) {
      console.log('🗑️  Removing existing organization assignments...')
      for (const orgUser of sara.organizationUsers) {
        await prisma.organizationUser.delete({
          where: { id: orgUser.id }
        })
        console.log(`  - Removed from ${orgUser.organization.name}`)
      }
    }
    
    // Find EFAA organization
    const efaaOrg = await prisma.organization.findFirst({
      where: {
        OR: [
          { slug: 'efaa' },
          { name: { contains: 'EFAA', mode: 'insensitive' } }
        ]
      }
    })
    
    if (!efaaOrg) {
      console.log('❌ EFAA organization not found')
      return
    }
    
    console.log(`\n🔧 Assigning Sara to: ${efaaOrg.name}`)
    
    // Create organization membership
    const orgMembership = await prisma.organizationUser.create({
      data: {
        organizationId: efaaOrg.id,
        userId: sara.id,
        role: 'ADMIN', // Give her admin access to her organization
        permissions: ['APPROVE_IDEAS', 'VIEW_ALL_CONTENT', 'MANAGE_PLANS'],
        isActive: true,
        joinedAt: new Date()
      }
    })
    
    console.log('✅ Successfully assigned Sara to EFAA organization!')
    console.log(`📊 Organization: ${efaaOrg.name}`)
    console.log(`👤 Role: ${orgMembership.role}`)
    console.log(`🔐 Permissions: ${orgMembership.permissions.join(', ')}`)
    
    // Verify the assignment
    const updatedSara = await prisma.user.findUnique({
      where: { email: 'sara.zambelli@efaa.com' },
      include: {
        organizationUsers: {
          include: {
            organization: true
          }
        }
      }
    })
    
    console.log(`\n🔍 Verification - Sara now has ${updatedSara.organizationUsers.length} organization(s):`)
    updatedSara.organizationUsers.forEach(orgUser => {
      console.log(`  - ${orgUser.organization.name} (${orgUser.role})`)
    })
    
  } catch (error) {
    console.error('❌ Error reassigning user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

removeAndReassignUser() 