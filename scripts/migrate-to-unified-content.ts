import { PrismaClient } from '@prisma/client'
import { CONTENT_ITEM_STATUS, WORKFLOW_STAGE } from '../src/lib/utils/enum-constants'

const prisma = new PrismaClient()

async function migrateToUnifiedContent() {
  console.log('🚀 Starting migration to unified ContentItem structure...\n')

  try {
    // Step 1: Migrate Ideas to ContentItems
    console.log('📝 Step 1: Migrating Ideas to ContentItems...')
    const ideas = await prisma.idea.findMany({
      include: {
        createdBy: true,
        contentDrafts: {
          include: {
            feedbacks: true,
            media: true,
            scheduledPosts: true
          }
        }
      }
    })

    console.log(`Found ${ideas.length} ideas to migrate`)

    for (const idea of ideas) {
      console.log(`\n🔄 Migrating idea: "${idea.title}"`)
      
      // Create the unified ContentItem
      const contentItem = await prisma.contentItem.create({
        data: {
          title: idea.title,
          description: idea.description,
          contentType: idea.contentType || 'SOCIAL_MEDIA_POST',
          mediaType: idea.mediaType,
          status: idea.status === 'APPROVED' ? CONTENT_ITEM_STATUS.CONTENT_REVIEW : CONTENT_ITEM_STATUS.IDEA,
          currentStage: idea.status === 'APPROVED' ? WORKFLOW_STAGE.CONTENT_REVIEW : WORKFLOW_STAGE.IDEA,
          createdById: idea.createdById,
          deliveryItemId: idea.deliveryItemId,
          metadata: {
            originalIdeaId: idea.id,
            publishingDateTime: idea.publishingDateTime,
            savedForLater: idea.savedForLater
          }
        }
      })

      console.log(`✅ Created ContentItem: ${contentItem.id}`)

      // Create stage transition for initial stage
      await prisma.stageTransition.create({
        data: {
          contentItemId: contentItem.id,
          fromStage: WORKFLOW_STAGE.IDEA,
          toStage: contentItem.currentStage,
          transitionedBy: idea.createdById,
          notes: 'Initial migration from Idea'
        }
      })

      // Step 2: Migrate ContentDrafts data to ContentItem
      if (idea.contentDrafts.length > 0) {
        console.log(`📄 Found ${idea.contentDrafts.length} content drafts to merge`)
        
        // Use the most recent draft's body content
        const latestDraft = idea.contentDrafts.sort((a: any, b: any) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )[0]

        // Update ContentItem with draft data
        await prisma.contentItem.update({
          where: { id: contentItem.id },
          data: {
            body: latestDraft.body,
            status: mapDraftStatusToContentItemStatus(latestDraft.status),
            currentStage: mapDraftStatusToWorkflowStage(latestDraft.status),
            assignedToId: latestDraft.createdById
          }
        })

        // Migrate feedback
        for (const draft of idea.contentDrafts) {
          for (const feedback of draft.feedbacks) {
            await prisma.contentItemFeedback.create({
              data: {
                contentItemId: contentItem.id,
                comment: feedback.comment,
                createdById: feedback.createdById
              }
            })
          }
        }

        // Migrate media
        for (const draft of idea.contentDrafts) {
          for (const media of draft.media) {
            await prisma.contentItemMedia.create({
              data: {
                contentItemId: contentItem.id,
                url: media.url,
                filename: media.filename,
                contentType: media.contentType,
                size: media.size,
                uploadedById: media.uploadedById
              }
            })
          }
        }

        // Migrate scheduled posts
        for (const draft of idea.contentDrafts) {
          for (const scheduledPost of draft.scheduledPosts) {
            await prisma.contentItemScheduledPost.create({
              data: {
                contentItemId: contentItem.id,
                scheduledDate: scheduledPost.scheduledDate,
                status: scheduledPost.status,
                metadata: scheduledPost.metadata || {}
              }
            })
          }
        }

        // Create stage transition for content review
        if (latestDraft.status !== 'DRAFT') {
          await prisma.stageTransition.create({
            data: {
              contentItemId: contentItem.id,
              fromStage: WORKFLOW_STAGE.IDEA,
              toStage: mapDraftStatusToWorkflowStage(latestDraft.status),
              transitionedBy: latestDraft.createdById,
              notes: `Migrated from ContentDraft status: ${latestDraft.status}`
            }
          })
        }

        console.log(`✅ Migrated ${idea.contentDrafts.length} drafts and associated data`)
      }

      // Step 3: Migrate comments
      const ideaComments = await prisma.ideaComment.findMany({
        where: { ideaId: idea.id }
      })

      for (const comment of ideaComments) {
        await prisma.contentItemComment.create({
          data: {
            contentItemId: contentItem.id,
            comment: comment.comment,
            createdById: comment.createdById
          }
        })
      }

      if (ideaComments.length > 0) {
        console.log(`✅ Migrated ${ideaComments.length} comments`)
      }
    }

    console.log('\n🎉 Migration completed successfully!')
    console.log('\n📊 Summary:')
    
    const totalContentItems = await prisma.contentItem.count()
    const totalTransitions = await prisma.stageTransition.count()
    const totalFeedbacks = await prisma.contentItemFeedback.count()
    const totalMedia = await prisma.contentItemMedia.count()
    
    console.log(`- Total ContentItems created: ${totalContentItems}`)
    console.log(`- Total StageTransitions: ${totalTransitions}`)
    console.log(`- Total Feedbacks migrated: ${totalFeedbacks}`)
    console.log(`- Total Media files migrated: ${totalMedia}`)

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

function mapDraftStatusToContentItemStatus(draftStatus: string): 'IDEA' | 'CONTENT_REVIEW' | 'APPROVED' | 'REJECTED' | 'PUBLISHED' {
  switch (draftStatus) {
    case 'DRAFT':
      return 'CONTENT_REVIEW'
    case 'AWAITING_FEEDBACK':
      return 'CONTENT_REVIEW'
    case 'AWAITING_REVISION':
      return 'CONTENT_REVIEW'
    case 'APPROVED':
      return 'APPROVED'
    case 'REJECTED':
      return 'REJECTED'
    case 'PUBLISHED':
      return 'PUBLISHED'
    default:
      return 'CONTENT_REVIEW'
  }
}

function mapDraftStatusToWorkflowStage(draftStatus: string): 'IDEA' | 'CONTENT_REVIEW' | 'APPROVED' | 'REJECTED' | 'PUBLISHED' {
  switch (draftStatus) {
    case 'DRAFT':
      return 'CONTENT_REVIEW'
    case 'AWAITING_FEEDBACK':
      return 'CONTENT_REVIEW'
    case 'AWAITING_REVISION':
      return 'CONTENT_REVIEW'
    case 'APPROVED':
      return 'APPROVED'
    case 'REJECTED':
      return 'REJECTED'
    case 'PUBLISHED':
      return 'PUBLISHED'
    default:
      return 'CONTENT_REVIEW'
  }
}

// Run the migration
migrateToUnifiedContent()
  .then(() => {
    console.log('\n✅ Migration script completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Migration script failed:', error)
    process.exit(1)
  }) 