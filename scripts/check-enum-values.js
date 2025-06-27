const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkEnumValues() {
  console.log('🔍 Checking current enum values in database...');

  try {
    // Check IdeaStatus values
    console.log('\n📝 Checking IdeaStatus values...');
    const ideaStatuses = await prisma.$queryRaw`
      SELECT DISTINCT status::text as status_value, COUNT(*) as count
      FROM "Idea"
      GROUP BY status::text
      ORDER BY status::text
    `;
    console.log('IdeaStatus values:', ideaStatuses);

    // Check DraftStatus values
    console.log('\n📝 Checking DraftStatus values...');
    const draftStatuses = await prisma.$queryRaw`
      SELECT DISTINCT status::text as status_value, COUNT(*) as count
      FROM "ContentDraft"
      GROUP BY status::text
      ORDER BY status::text
    `;
    console.log('DraftStatus values:', draftStatuses);

    // Check for approved ideas without content drafts
    console.log('\n📝 Checking approved ideas...');
    const approvedIdeas = await prisma.idea.findMany({
      where: { status: 'APPROVED' },
      select: { id: true, title: true, status: true }
    });
    console.log(`Approved ideas: ${approvedIdeas.length}`);

    for (const idea of approvedIdeas) {
      const drafts = await prisma.contentDraft.findMany({
        where: { ideaId: idea.id }
      });
      console.log(`- "${idea.title}" (${idea.id}): ${drafts.length} drafts`);
    }

  } catch (error) {
    console.error('❌ Error checking enum values:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkEnumValues()
  .then(() => {
    console.log('✅ Check completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Check failed:', error);
    process.exit(1);
  }); 