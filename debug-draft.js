const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDraft() {
  try {
    const draft = await prisma.contentDraft.findUnique({
      where: { id: 'cmf60t3mc0001wytzsz7bo9er' },
      include: {
        Idea: true
      }
    });
    console.log('Draft found:', !!draft);
    if (draft) {
      console.log('Draft ideaId:', draft.ideaId);
      console.log('Draft organizationId:', draft.organizationId);
      console.log('Has Idea:', !!draft.Idea);
      if (draft.Idea) {
        console.log('Idea title:', draft.Idea.title);
        console.log('Idea description:', draft.Idea.description);
        console.log('Idea organizationId:', draft.Idea.organizationId);
        console.log('Same organization:', draft.organizationId === draft.Idea.organizationId);
      } else {
        console.log('No idea found for this draft');
      }
    } else {
      console.log('Draft not found');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDraft();
