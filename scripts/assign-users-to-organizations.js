const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function assignUsersToOrganizations() {
  try {
    console.log('🔍 Finding users without organization assignments...')
    
    // Find all users
    const users = await prisma.user.findMany({
      include: {
        organizationUsers: {
          include: {
            organization: true
          }
        }
      }
    })
    
    console.log(`📊 Found ${users.length} total users`)
    
    // Find users without organization assignments
    const usersWithoutOrgs = users.filter(user => user.organizationUsers.length === 0)
    
    if (usersWithoutOrgs.length === 0) {
      console.log('✅ All users are already assigned to organizations!')
      return
    }
    
    console.log(`⚠️  Found ${usersWithoutOrgs.length} users without organization assignments:`)
    usersWithoutOrgs.forEach(user => {
      console.log(`  - ${user.name} (${user.email})`)
    })
    
    // Find all organizations
    const organizations = await prisma.organization.findMany({
      orderBy: { createdAt: 'asc' }
    })
    
    if (organizations.length === 0) {
      console.log('❌ No organizations found in database')
      return
    }
    
    console.log(`\n📋 Available organizations:`)
    organizations.forEach(org => {
      console.log(`  - ${org.name} (${org.slug})`)
    })
    
    // Create a mapping of email domains to organizations
    const domainToOrg = {}
    organizations.forEach(org => {
      if (org.slug === 'efaa') {
        domainToOrg['efaa.com'] = org
      } else if (org.slug === 'savionray') {
        domainToOrg['savionray.com'] = org
      }
      // Add more mappings as needed
    })
    
    // Default organization (SavionRay)
    const defaultOrg = organizations.find(org => org.slug === 'savionray') || organizations[0]
    
    console.log('\n🔧 Assigning users to organizations...')
    
    for (const user of usersWithoutOrgs) {
      const emailDomain = user.email.split('@')[1]?.toLowerCase()
      const targetOrg = domainToOrg[emailDomain] || defaultOrg
      
      console.log(`\n👤 Assigning ${user.name} (${user.email}) to ${targetOrg.name}`)
      
      // Determine role based on user's system role
      let orgRole = 'MEMBER'
      if (user.role === 'ADMIN') {
        orgRole = 'OWNER'
      } else if (user.role === 'CLIENT') {
        orgRole = 'ADMIN'
      }
      
      // Create organization membership
      const orgMembership = await prisma.organizationUser.create({
        data: {
          organizationId: targetOrg.id,
          userId: user.id,
          role: orgRole,
          permissions: getPermissionsForRole(orgRole),
          isActive: true,
          joinedAt: new Date()
        }
      })
      
      console.log(`  ✅ Assigned as ${orgRole}`)
    }
    
    console.log('\n✅ All users have been assigned to organizations!')
    
    // Final verification
    const finalUsers = await prisma.user.findMany({
      include: {
        organizationUsers: {
          include: {
            organization: true
          }
        }
      }
    })
    
    console.log('\n🔍 Final verification:')
    finalUsers.forEach(user => {
      console.log(`\n👤 ${user.name} (${user.email}):`)
      if (user.organizationUsers.length === 0) {
        console.log(`  ⚠️  No organizations assigned`)
      } else {
        user.organizationUsers.forEach(orgUser => {
          console.log(`  ✅ ${orgUser.organization.name} (${orgUser.role})`)
        })
      }
    })
    
  } catch (error) {
    console.error('❌ Error assigning users to organizations:', error)
  } finally {
    await prisma.$disconnect()
  }
}

function getPermissionsForRole(role) {
  switch (role) {
    case 'OWNER':
      return ['ALL']
    case 'ADMIN':
      return ['APPROVE_IDEAS', 'VIEW_ALL_CONTENT', 'MANAGE_PLANS', 'MANAGE_USERS']
    case 'MANAGER':
      return ['APPROVE_IDEAS', 'VIEW_ALL_CONTENT', 'MANAGE_PLANS']
    case 'MEMBER':
      return ['CREATE_IDEAS', 'CREATE_DRAFTS', 'VIEW_CONTENT']
    case 'VIEWER':
      return ['VIEW_CONTENT']
    default:
      return ['VIEW_CONTENT']
  }
}

assignUsersToOrganizations() 