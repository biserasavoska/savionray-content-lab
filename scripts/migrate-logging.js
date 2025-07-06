#!/usr/bin/env node

/**
 * LOGGING MIGRATION SCRIPT
 * 
 * This script helps identify console.log statements in the codebase
 * and provides guidance on migrating them to the new centralized logging system.
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// Colors for output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function findConsoleStatements() {
  log('🔍 Scanning for console statements...', 'blue')
  
  try {
    // Use grep to find console statements
    const result = execSync(
      'grep -r "console\\.(log|error|warn|info|debug)" src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx"',
      { encoding: 'utf8' }
    )
    
    const lines = result.trim().split('\n').filter(line => line.length > 0)
    
    if (lines.length === 0) {
      log('✅ No console statements found!', 'green')
      return []
    }
    
    log(`📊 Found ${lines.length} console statements:`, 'yellow')
    console.log('')
    
    const statements = []
    
    lines.forEach((line, index) => {
      const [filePath, ...rest] = line.split(':')
      const content = rest.join(':').trim()
      
      // Extract the console statement
      const match = content.match(/console\.(log|error|warn|info|debug)\s*\(([^)]+)\)/)
      if (match) {
        const level = match[1]
        const args = match[2]
        
        statements.push({
          file: filePath,
          level,
          args,
          content,
          lineNumber: index + 1
        })
        
        log(`${index + 1}. ${filePath}`, 'cyan')
        log(`   ${level.toUpperCase()}: ${args}`, 'yellow')
        console.log('')
      }
    })
    
    return statements
    
  } catch (error) {
    if (error.status === 1) {
      log('✅ No console statements found!', 'green')
      return []
    }
    log(`❌ Error scanning files: ${error.message}`, 'red')
    return []
  }
}

function categorizeStatements(statements) {
  const categories = {
    debug: [],
    info: [],
    warn: [],
    error: [],
    mixed: []
  }
  
  statements.forEach(stmt => {
    if (stmt.level === 'log') {
      // Try to determine if it's debug or info based on content
      if (stmt.args.includes('debug') || stmt.args.includes('DEBUG')) {
        categories.debug.push(stmt)
      } else {
        categories.info.push(stmt)
      }
    } else {
      categories[stmt.level].push(stmt)
    }
  })
  
  return categories
}

function generateMigrationGuide(statements) {
  log('📝 Generating migration guide...', 'blue')
  console.log('')
  
  const categories = categorizeStatements(statements)
  
  log('🔧 MIGRATION GUIDE', 'magenta')
  log('==================', 'magenta')
  console.log('')
  
  log('1. Import the logger:', 'yellow')
  log('   import { logger } from "@/lib/utils/logger"', 'cyan')
  console.log('')
  
  log('2. Replace console statements:', 'yellow')
  console.log('')
  
  Object.entries(categories).forEach(([category, stmts]) => {
    if (stmts.length > 0) {
      log(`${category.toUpperCase()} statements (${stmts.length}):`, 'green')
      stmts.forEach(stmt => {
        log(`   ${stmt.file}:`, 'cyan')
        log(`   OLD: ${stmt.content}`, 'red')
        
        // Generate replacement
        let replacement = ''
        if (category === 'debug') {
          replacement = `logger.debug(${stmt.args})`
        } else if (category === 'info') {
          replacement = `logger.info(${stmt.args})`
        } else if (category === 'warn') {
          replacement = `logger.warn(${stmt.args})`
        } else if (category === 'error') {
          replacement = `logger.error(${stmt.args})`
        }
        
        log(`   NEW: ${replacement}`, 'green')
        console.log('')
      })
    }
  })
  
  log('3. For React components, use the useLogger hook:', 'yellow')
  log('   import { useLogger } from "@/lib/utils/logger"', 'cyan')
  log('   const logger = useLogger("ComponentName")', 'cyan')
  console.log('')
  
  log('4. For API routes, use the middleware:', 'yellow')
  log('   import { withLogging, withDbLogging } from "@/lib/middleware/logger"', 'cyan')
  console.log('')
}

function generateMigrationScript(statements) {
  log('🤖 Generating automated migration script...', 'blue')
  
  const script = `#!/usr/bin/env node

/**
 * AUTOMATED LOGGING MIGRATION SCRIPT
 * 
 * This script automatically replaces console statements with logger calls.
 * Run with: node migrate-console-statements.js
 */

const fs = require('fs')
const path = require('path')

const replacements = [
${statements.map(stmt => {
  const replacement = stmt.level === 'log' 
    ? `logger.info(${stmt.args})`
    : `logger.${stmt.level}(${stmt.args})`
  
  return `  {
    file: '${stmt.file}',
    search: ${JSON.stringify(stmt.content)},
    replace: '${replacement}'
  }`
}).join(',\n')}
]

function migrateFile(filePath, search, replace) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const newContent = content.replace(search, replace)
    
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent)
      console.log(\`✅ Migrated: \${filePath}\`)
      return true
    }
    return false
  } catch (error) {
    console.error(\`❌ Error migrating \${filePath}: \${error.message}\`)
    return false
  }
}

function main() {
  console.log('🚀 Starting automated migration...')
  
  let migrated = 0
  let errors = 0
  
  replacements.forEach(({ file, search, replace }) => {
    if (migrateFile(file, search, replace)) {
      migrated++
    } else {
      errors++
    }
  })
  
  console.log(\`\\n📊 Migration complete: \${migrated} files migrated, \${errors} errors\`)
}

if (require.main === module) {
  main()
}
`
  
  fs.writeFileSync('scripts/migrate-console-statements.js', script)
  log('✅ Generated: scripts/migrate-console-statements.js', 'green')
}

function main() {
  log('🔧 LOGGING MIGRATION TOOL', 'magenta')
  log('==========================', 'magenta')
  console.log('')
  
  const statements = findConsoleStatements()
  
  if (statements.length === 0) {
    log('🎉 No migration needed!', 'green')
    return
  }
  
  generateMigrationGuide(statements)
  generateMigrationScript(statements)
  
  console.log('')
  log('📋 NEXT STEPS:', 'yellow')
  log('1. Review the migration guide above', 'cyan')
  log('2. Run: node scripts/migrate-console-statements.js', 'cyan')
  log('3. Test the application', 'cyan')
  log('4. Commit the changes', 'cyan')
  console.log('')
  
  log('⚠️  IMPORTANT:', 'red')
  log('- Always review automated changes before committing', 'yellow')
  log('- Test thoroughly after migration', 'yellow')
  log('- Some statements may need manual adjustment', 'yellow')
}

if (require.main === module) {
  main()
} 