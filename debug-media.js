const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function debugMedia() {
  try {
    console.log('🔍 Checking media records...')
    
    // Check all media records
    const allMedia = await prisma.media.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' }
    })
    
    console.log('📊 Total media records found:', allMedia.length)
    console.log('📋 Recent media records:')
    allMedia.forEach((media, index) => {
      console.log(`${index + 1}. ID: ${media.id}`)
      console.log(`   Filename: ${media.filename}`)
      console.log(`   ContentDraftId: ${media.contentDraftId}`)
      console.log(`   OrganizationId: ${media.organizationId}`)
      console.log(`   URL: ${media.url}`)
      console.log(`   Created: ${media.createdAt}`)
      console.log('---')
    })
    
    // Check specific content draft
    const contentDraftId = 'cmfe3sq8o0007nx7fe1lr5teg'
    console.log(`\n🔍 Checking media for content draft: ${contentDraftId}`)
    
    const mediaForDraft = await prisma.media.findMany({
      where: { contentDraftId }
    })
    
    console.log(`📊 Media records for draft ${contentDraftId}:`, mediaForDraft.length)
    mediaForDraft.forEach((media, index) => {
      console.log(`${index + 1}. ${media.filename} (${media.url})`)
    })
    
    // Check organization
    const orgId = 'cmeyjy1hq0000pj7fco1ptwle'
    console.log(`\n🔍 Checking media for organization: ${orgId}`)
    
    const mediaForOrg = await prisma.media.findMany({
      where: { organizationId: orgId }
    })
    
    console.log(`📊 Media records for org ${orgId}:`, mediaForOrg.length)
    mediaForOrg.forEach((media, index) => {
      console.log(`${index + 1}. ${media.filename} (${media.url})`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugMedia()
