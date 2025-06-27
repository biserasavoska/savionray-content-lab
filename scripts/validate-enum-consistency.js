#!/usr/bin/env node

/**
 * ENUM CONSISTENCY VALIDATOR
 * 
 * This script validates that the enum values in the Prisma schema
 * match the centralized enum constants in the application.
 * 
 * Run this script before deploying to catch enum mismatches early.
 * 
 * Usage: node scripts/validate-enum-consistency.js
 */

const fs = require('fs');
const path = require('path');

// Read the centralized enum constants
const enumConstantsPath = path.join(__dirname, '../src/lib/utils/enum-constants.ts');
const enumConstantsContent = fs.readFileSync(enumConstantsPath, 'utf8');

// Read the Prisma schema
const prismaSchemaPath = path.join(__dirname, '../prisma/schema.prisma');
const prismaSchemaContent = fs.readFileSync(prismaSchemaPath, 'utf8');

// Extract enum values from the centralized constants
function extractEnumValues(content, enumName) {
  const regex = new RegExp(`${enumName}\\s*=\\s*{[^}]+}`, 's');
  const match = content.match(regex);
  if (!match) return [];
  
  const enumBlock = match[0];
  const valueRegex = /(\w+):\s*['"`](\w+)['"`]/g;
  const values = [];
  let valueMatch;
  
  while ((valueMatch = valueRegex.exec(enumBlock)) !== null) {
    values.push(valueMatch[2]);
  }
  
  return values;
}

// Extract enum values from Prisma schema
function extractPrismaEnumValues(content, enumName) {
  const regex = new RegExp(`enum\\s+${enumName}\\s*{[^}]+}`, 's');
  const match = content.match(regex);
  if (!match) return [];
  
  const enumBlock = match[0];
  const valueRegex = /^\s*(\w+)\s*$/gm;
  const values = [];
  let valueMatch;
  
  while ((valueMatch = valueRegex.exec(enumBlock)) !== null) {
    values.push(valueMatch[1]);
  }
  
  return values;
}

// Define the enums to validate
const enumsToValidate = [
  { name: 'IDEA_STATUS', prismaName: 'IdeaStatus' },
  { name: 'DRAFT_STATUS', prismaName: 'DraftStatus' },
  { name: 'SCHEDULE_STATUS', prismaName: 'ScheduleStatus' },
  { name: 'MEDIA_TYPE', prismaName: 'MediaType' },
  { name: 'CONTENT_TYPE', prismaName: 'ContentType' },
  { name: 'DELIVERY_PLAN_STATUS', prismaName: 'DeliveryPlanStatus' },
  { name: 'DELIVERY_ITEM_STATUS', prismaName: 'DeliveryItemStatus' },
  { name: 'USER_ROLE', prismaName: 'UserRole' }
];

console.log('🔍 Validating enum consistency between Prisma schema and centralized constants...\n');

let hasErrors = false;

for (const enumDef of enumsToValidate) {
  const constantValues = extractEnumValues(enumConstantsContent, enumDef.name);
  const prismaValues = extractPrismaEnumValues(prismaSchemaContent, enumDef.prismaName);
  
  console.log(`📝 Validating ${enumDef.name} (Prisma: ${enumDef.prismaName})`);
  
  if (constantValues.length === 0) {
    console.log(`❌ ERROR: Could not extract ${enumDef.name} from enum constants`);
    hasErrors = true;
    continue;
  }
  
  if (prismaValues.length === 0) {
    console.log(`❌ ERROR: Could not extract ${enumDef.prismaName} from Prisma schema`);
    hasErrors = true;
    continue;
  }
  
  // Check for missing values in constants
  const missingInConstants = prismaValues.filter(value => !constantValues.includes(value));
  if (missingInConstants.length > 0) {
    console.log(`❌ ERROR: Missing in constants: ${missingInConstants.join(', ')}`);
    hasErrors = true;
  }
  
  // Check for missing values in Prisma schema
  const missingInPrisma = constantValues.filter(value => !prismaValues.includes(value));
  if (missingInPrisma.length > 0) {
    console.log(`❌ ERROR: Missing in Prisma schema: ${missingInPrisma.join(', ')}`);
    hasErrors = true;
  }
  
  // Check for extra values in constants
  const extraInConstants = constantValues.filter(value => !prismaValues.includes(value));
  if (extraInConstants.length > 0) {
    console.log(`⚠️  WARNING: Extra values in constants: ${extraInConstants.join(', ')}`);
  }
  
  if (missingInConstants.length === 0 && missingInPrisma.length === 0) {
    console.log(`✅ ${enumDef.name} is consistent`);
  }
  
  console.log(`   Constants: [${constantValues.join(', ')}]`);
  console.log(`   Prisma:    [${prismaValues.join(', ')}]`);
  console.log('');
}

if (hasErrors) {
  console.log('❌ Enum validation failed! Please fix the inconsistencies before deploying.');
  console.log('\n📋 To fix enum mismatches:');
  console.log('1. Update the centralized enum constants in src/lib/utils/enum-constants.ts');
  console.log('2. Update the Prisma schema in prisma/schema.prisma');
  console.log('3. Run: npx prisma generate');
  console.log('4. Run: npx prisma db push (or create a migration)');
  console.log('5. Re-run this validation script');
  process.exit(1);
} else {
  console.log('✅ All enums are consistent! Safe to deploy.');
}

// Additional validation: Check for hardcoded enum strings in the codebase
console.log('\n🔍 Checking for hardcoded enum strings in the codebase...');

const srcDir = path.join(__dirname, '../src');
const hardcodedEnums = [];

function scanDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      scanDirectory(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Skip the enum constants file itself
      if (filePath.includes('enum-constants.ts')) continue;
      
      // Check for hardcoded enum values
      const enumValues = [
        'PENDING', 'APPROVED', 'REJECTED',
        'DRAFT', 'AWAITING_FEEDBACK', 'AWAITING_REVISION', 'PUBLISHED',
        'SCHEDULED', 'FAILED',
        'PHOTO', 'GRAPH_OR_INFOGRAPHIC', 'VIDEO', 'SOCIAL_CARD', 'POLL', 'CAROUSEL',
        'NEWSLETTER', 'BLOG_POST', 'SOCIAL_MEDIA_POST', 'WEBSITE_COPY', 'EMAIL_CAMPAIGN',
        'ACTIVE', 'COMPLETED', 'CANCELLED',
        'IN_PROGRESS', 'REVIEW', 'DELIVERED',
        'CREATIVE', 'CLIENT', 'ADMIN'
      ];
      
      for (const enumValue of enumValues) {
        if (content.includes(`'${enumValue}'`) || content.includes(`"${enumValue}"`)) {
          hardcodedEnums.push({
            file: path.relative(process.cwd(), filePath),
            enumValue,
            line: content.split('\n').findIndex(line => 
              line.includes(`'${enumValue}'`) || line.includes(`"${enumValue}"`)
            ) + 1
          });
        }
      }
    }
  }
}

scanDirectory(srcDir);

if (hardcodedEnums.length > 0) {
  console.log('\n⚠️  WARNING: Found hardcoded enum strings. Consider using centralized constants:');
  hardcodedEnums.forEach(({ file, enumValue, line }) => {
    console.log(`   ${file}:${line} - "${enumValue}"`);
  });
  console.log('\n💡 Recommendation: Replace hardcoded strings with imports from @/lib/utils/enum-constants');
} else {
  console.log('✅ No hardcoded enum strings found!');
} 