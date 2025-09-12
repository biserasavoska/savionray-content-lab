const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testApiQuery() {
  try {
    const contentDraft = await prisma.contentDraft.findUnique({
      where: {
        id: 'cmf60t3mc0001wytzsz7bo9er',
        organizationId: 'cmelsibbb0000rqbt1b66srwo'
      },
      include: {
        Idea: {
          include: {
            User: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                image: true
              }
            }
          }
        },
        User: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            image: true
          }
        },
        Feedback: {
          include: {
            User: {
              select: {
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        Media: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    console.log('API Query Result:');
    console.log('Content draft found:', !!contentDraft);
    if (contentDraft) {
      console.log('Has Idea:', !!contentDraft.Idea);
      if (contentDraft.Idea) {
        console.log('Idea title:', contentDraft.Idea.title);
        console.log('Idea description:', contentDraft.Idea.description);
      }
      console.log('JSON keys:', Object.keys(contentDraft));
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testApiQuery();
