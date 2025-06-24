const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function migrateStatusEnums() {
  console.log('Starting safe migration of status enums...')
  
  try {
    // Step 1: Update Idea statuses using raw SQL
    console.log('Updating Idea statuses...')
    
    const ideaUpdates = [
      { old: 'PENDING_CLIENT_APPROVAL', new: 'PENDING' },
      { old: 'APPROVED_BY_CLIENT', new: 'APPROVED' },
      { old: 'REJECTED_BY_CLIENT', new: 'REJECTED' }
    ]
    
    for (const update of ideaUpdates) {
      const result = await prisma.$executeRaw`
        UPDATE "Idea" 
        SET status = ${update.new}::text::"IdeaStatus" 
        WHERE status = ${update.old}::text::"IdeaStatus"
      `
      console.log(`Updated ideas from ${update.old} to ${update.new}`)
    }
    
    // Step 2: Update ContentDraft statuses using raw SQL
    console.log('Updating ContentDraft statuses...')
    
    const draftUpdates = [
      { old: 'PENDING_FIRST_REVIEW', new: 'DRAFT' },
      { old: 'NEEDS_REVISION', new: 'AWAITING_REVISION' },
      { old: 'PENDING_FINAL_APPROVAL', new: 'AWAITING_FEEDBACK' },
      { old: 'APPROVED_FOR_PUBLISHING', new: 'APPROVED' }
    ]
    
    for (const update of draftUpdates) {
      const result = await prisma.$executeRaw`
        UPDATE "ContentDraft" 
        SET status = ${update.new}::text::"DraftStatus" 
        WHERE status = ${update.old}::text::"DraftStatus"
      `
      console.log(`Updated content drafts from ${update.old} to ${update.new}`)
    }
    
    console.log('✅ Migration completed successfully!')
    console.log('You can now run: npx prisma migrate dev --name update_status_enums')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the migration
migrateStatusEnums()
  .catch((error) => {
    console.error('Migration failed:', error)
    process.exit(1)
  }) 