const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkDraft() {
  try {
    const draftId = 'cmfe3sq8o0007nx7fe1lr5teg'
    const media = await prisma.media.findMany({ where: { contentDraftId: draftId } })
    console.log('Media for draft', draftId, ':', media.length)
    
    const draft = await prisma.contentDraft.findUnique({ 
      where: { id: draftId },
      include: { Media: true }
    })
    console.log('Draft exists:', !!draft)
    console.log('Draft media count:', draft?.Media?.length || 0)
    
    if (draft) {
      console.log('Draft details:', {
        id: draft.id,
        status: draft.status,
        organizationId: draft.organizationId,
        mediaCount: draft.Media.length
      })
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDraft()
