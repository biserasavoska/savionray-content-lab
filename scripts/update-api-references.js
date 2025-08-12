#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

console.log('🔧 Updating API References from content-drafts to content-items...')

// Files that need API endpoint updates
const filesToUpdate = [
  'src/components/ready-content/ReadyContentList.tsx',
  'src/components/approved-content/ApprovedContentList.tsx',
  'src/app/content-review/[id]/page.tsx',
  'src/app/content-review/ContentReviewList.tsx',
  'src/components/content/GPT5EnhancedContentForm.tsx',
  'src/app/ready-content/[id]/edit/page.tsx',
  'src/app/ready-content/[id]/edit/MediaUpload.tsx',
  'src/lib/middleware/enhanced-api-security.ts'
]

// Update API references
function updateApiReferences() {
  console.log('\n🔧 Updating API references...')
  
  let updatedCount = 0
  let errorCount = 0
  
  filesToUpdate.forEach(file => {
    if (fs.existsSync(file)) {
      try {
        let content = fs.readFileSync(file, 'utf8')
        let originalContent = content
        
        // Replace API endpoints
        content = content.replace(/\/api\/content-drafts\//g, '/api/content-items/')
        content = content.replace(/\/api\/content-drafts$/g, '/api/content-items')
        
        // Update variable names and comments
        content = content.replace(/contentDraftId/g, 'contentItemId')
        content = content.replace(/draftId/g, 'contentItemId')
        content = content.replace(/content-drafts/g, 'content-items')
        content = content.replace(/contentDrafts/g, 'contentItems')
        
        if (content !== originalContent) {
          fs.writeFileSync(file, content, 'utf8')
          console.log(`  ✅ Updated: ${file}`)
          updatedCount++
        } else {
          console.log(`  ℹ️  No changes needed: ${file}`)
        }
      } catch (error) {
        console.log(`  ❌ Error updating ${file}: ${error.message}`)
        errorCount++
      }
    } else {
      console.log(`  ⚠️  File not found: ${file}`)
    }
  })
  
  console.log(`\n📊 Update Summary:`)
  console.log(`  - Files updated: ${updatedCount}`)
  console.log(`  - Errors: ${errorCount}`)
  
  return { updatedCount, errorCount }
}

// Main execution
async function main() {
  try {
    const { updatedCount, errorCount } = updateApiReferences()
    
    console.log('\n🎉 API Reference Update Complete!')
    console.log('\n📋 What was updated:')
    console.log('1. API endpoints: /api/content-drafts → /api/content-items')
    console.log('2. Variable names: contentDraftId → contentItemId')
    console.log('3. Route parameters: draftId → contentItemId')
    
    if (errorCount > 0) {
      console.log(`\n⚠️  ${errorCount} files had errors during update`)
    }
    
  } catch (error) {
    console.error('❌ Update failed:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}
