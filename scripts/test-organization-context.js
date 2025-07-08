const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testOrganizationContext() {
  console.log('🧪 Testing Organization Context...\n')

  try {
    // 1. Test fetching organizations
    console.log('1. Fetching organizations...')
    const organizations = await prisma.organization.findMany({
      include: {
        _count: {
          select: {
            ideas: true,
            contentDrafts: true,
            deliveryPlans: true,
            contentItems: true
          }
        }
      }
    })
    console.log(`✅ Found ${organizations.length} organizations`)
    organizations.forEach(org => {
      console.log(`   - ${org.name} (${org.id})`)
      console.log(`     Ideas: ${org._count.ideas}, Drafts: ${org._count.contentDrafts}`)
    })

    // 2. Test fetching users with organizations
    console.log('\n2. Fetching users with organization memberships...')
    const users = await prisma.user.findMany({
      include: {
        organizations: {
          where: { isActive: true },
          include: {
            organization: true
          }
        }
      }
    })
    console.log(`✅ Found ${users.length} users`)
    users.forEach(user => {
      console.log(`   - ${user.email} (${user.name})`)
      user.organizations.forEach(membership => {
        console.log(`     Member of: ${membership.organization.name} (${membership.role})`)
      })
    })

    // 3. Test organization invitations
    console.log('\n3. Fetching organization invitations...')
    const invitations = await prisma.organizationInvitation.findMany({
      include: {
        organization: true
      }
    })
    console.log(`✅ Found ${invitations.length} invitations`)
    invitations.forEach(invitation => {
      console.log(`   - ${invitation.email} -> ${invitation.organization.name} (${invitation.status})`)
    })

    console.log('\n🎉 Organization context test completed successfully!')
    console.log('\n📋 Test Summary:')
    console.log(`   - Organizations: ${organizations.length}`)
    console.log(`   - Users: ${users.length}`)
    console.log(`   - Active memberships: ${users.reduce((sum, user) => sum + user.organizations.length, 0)}`)
    console.log(`   - Pending invitations: ${invitations.filter(i => i.status === 'PENDING').length}`)

  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testOrganizationContext() 