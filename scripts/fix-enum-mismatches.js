const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixEnumMismatches() {
  console.log('🔧 Fixing enum mismatches in database...');

  try {
    // Fix IdeaStatus enum mismatches
    console.log('📝 Fixing IdeaStatus enum values...');
    
    // Update old enum values to valid ones
    const ideaUpdates = await prisma.$executeRaw`
      UPDATE "Idea" 
      SET status = 'APPROVED'::text 
      WHERE status::text IN ('APPROVED_BY_CLIENT', 'APPROVED_FOR_PUBLISHING')
    `;
    console.log(`✅ Updated ${ideaUpdates} ideas with invalid status to APPROVED`);

    // Update PENDING to valid PENDING
    const pendingUpdates = await prisma.$executeRaw`
      UPDATE "Idea" 
      SET status = 'PENDING'::text 
      WHERE status::text = 'PENDING'
    `;
    console.log(`✅ Updated ${pendingUpdates} ideas with PENDING status`);

    // Fix DraftStatus enum mismatches
    console.log('📝 Fixing DraftStatus enum values...');
    
    // Update old enum values to valid ones
    const draftUpdates = await prisma.$executeRaw`
      UPDATE "ContentDraft" 
      SET status = 'AWAITING_FEEDBACK'::text 
      WHERE status::text IN ('PENDING_FIRST_REVIEW', 'PENDING_FINAL_APPROVAL')
    `;
    console.log(`✅ Updated ${draftUpdates} content drafts with invalid status to AWAITING_FEEDBACK`);

    // Update APPROVED_FOR_PUBLISHING to APPROVED
    const approvedUpdates = await prisma.$executeRaw`
      UPDATE "ContentDraft" 
      SET status = 'APPROVED'::text 
      WHERE status::text = 'APPROVED_FOR_PUBLISHING'
    `;
    console.log(`✅ Updated ${approvedUpdates} content drafts with APPROVED_FOR_PUBLISHING to APPROVED`);

    // Update NEEDS_REVISION to AWAITING_REVISION
    const revisionUpdates = await prisma.$executeRaw`
      UPDATE "ContentDraft" 
      SET status = 'AWAITING_REVISION'::text 
      WHERE status::text = 'NEEDS_REVISION'
    `;
    console.log(`✅ Updated ${revisionUpdates} content drafts with NEEDS_REVISION to AWAITING_REVISION`);

    // Verify the fixes
    console.log('\n🔍 Verifying fixes...');
    
    const ideas = await prisma.idea.findMany({
      select: { id: true, title: true, status: true }
    });
    
    const drafts = await prisma.contentDraft.findMany({
      select: { id: true, status: true, ideaId: true }
    });

    console.log(`\n📊 Summary:`);
    console.log(`- Total ideas: ${ideas.length}`);
    console.log(`- Total content drafts: ${drafts.length}`);
    
    const ideaStatuses = [...new Set(ideas.map(i => i.status))];
    const draftStatuses = [...new Set(drafts.map(d => d.status))];
    
    console.log(`- Valid idea statuses: ${ideaStatuses.join(', ')}`);
    console.log(`- Valid draft statuses: ${draftStatuses.join(', ')}`);

    // Check for approved ideas that should have content drafts
    const approvedIdeas = ideas.filter(i => i.status === 'APPROVED');
    console.log(`\n✅ Approved ideas: ${approvedIdeas.length}`);
    
    for (const idea of approvedIdeas) {
      const drafts = await prisma.contentDraft.findMany({
        where: { ideaId: idea.id }
      });
      
      if (drafts.length === 0) {
        console.log(`⚠️  Approved idea "${idea.title}" has no content drafts - creating one...`);
        
        // Create a content draft for approved ideas that don't have one
        await prisma.contentDraft.create({
          data: {
            status: 'DRAFT',
            body: `Content draft for: ${idea.title}\n\n${idea.description}`,
            contentType: 'SOCIAL_MEDIA_POST',
            ideaId: idea.id,
            createdById: idea.createdById || 'default-user-id' // You might need to adjust this
          }
        });
        console.log(`✅ Created content draft for idea "${idea.title}"`);
      }
    }

    console.log('\n🎉 Enum mismatch fixes completed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing enum mismatches:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixEnumMismatches()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }); 