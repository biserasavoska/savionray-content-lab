const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixUserOrganization() {
  try {
    console.log('🔍 Checking for users without organization assignments...')
    
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
    
    if (sara.organizationUsers.length > 0) {
      console.log('✅ Sara is already assigned to organizations:')
      sara.organizationUsers.forEach(orgUser => {
        console.log(`  - ${orgUser.organization.name} (${orgUser.role})`)
      })
      return
    }
    
    // Find available organizations
    const organizations = await prisma.organization.findMany({
      orderBy: { createdAt: 'asc' }
    })
    
    if (organizations.length === 0) {
      console.log('❌ No organizations found in database')
      return
    }
    
    console.log(`📋 Found ${organizations.length} organizations:`)
    organizations.forEach(org => {
      console.log(`  - ${org.name} (${org.slug})`)
    })
    
    // Find EFAA organization (more appropriate for Sara)
    const efaaOrg = organizations.find(org => org.slug === 'efaa' || org.name.toLowerCase().includes('efaa'))
    const targetOrg = efaaOrg || organizations[0]
    
    console.log(`\n🔧 Assigning Sara to: ${targetOrg.name}`)
    
    // Create organization membership
    const orgMembership = await prisma.organizationUser.create({
      data: {
        organizationId: targetOrg.id,
        userId: sara.id,
        role: 'ADMIN', // Give her admin access to her organization
        permissions: ['APPROVE_IDEAS', 'VIEW_ALL_CONTENT', 'MANAGE_PLANS'],
        isActive: true,
        joinedAt: new Date()
      }
    })
    
    console.log('✅ Successfully assigned Sara to organization!')
    console.log(`📊 Organization: ${targetOrg.name}`)
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
    console.error('❌ Error fixing user organization:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixUserOrganization() 