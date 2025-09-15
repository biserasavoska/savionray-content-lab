const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixMediaOrganization() {
  try {
    console.log('🔍 Fixing media organization IDs...')
    
    // Get the correct organization ID for the user
    const user = await prisma.user.findFirst({
      where: { email: 'admin@savionray.com' },
      include: {
        organizationUsers: {
          where: { isActive: true },
          include: { organization: true }
        }
      }
    })
    
    if (!user) {
      console.log('❌ User not found')
      return
    }
    
    console.log('👤 User found:', user.email)
    console.log('🏢 Organizations:', user.organizationUsers.map(ou => ({
      id: ou.organizationId,
      name: ou.organization.name
    })))
    
    const correctOrgId = user.organizationUsers[0]?.organizationId
    if (!correctOrgId) {
      console.log('❌ No organization found for user')
      return
    }
    
    console.log('✅ Correct organization ID:', correctOrgId)
    
    // Update all media records with wrong organization ID
    const result = await prisma.media.updateMany({
      where: { organizationId: 'default-org-id' },
      data: { organizationId: correctOrgId }
    })
    
    console.log(`✅ Updated ${result.count} media records`)
    
    // Verify the fix
    const mediaRecords = await prisma.media.findMany({
      where: { organizationId: correctOrgId }
    })
    
    console.log(`📊 Media records now in correct org: ${mediaRecords.length}`)
    mediaRecords.forEach((media, index) => {
      console.log(`${index + 1}. ${media.filename} (${media.contentDraftId})`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixMediaOrganization()
