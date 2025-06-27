#!/bin/bash

echo "🚀 Setting up staging environment (preserving users)..."

# Check if DATABASE_PUBLIC_URL is provided as argument
if [ -z "$1" ]; then
    echo "❌ Error: Please provide your Railway staging database URL"
    echo "Usage: ./scripts/setup-staging-preserve-users.sh 'postgresql://...'"
    echo ""
    echo "To get your staging database URL:"
    echo "1. Go to Railway Dashboard"
    echo "2. Select your staging project"
    echo "3. Go to Variables tab"
    echo "4. Copy the DATABASE_PUBLIC_URL value"
    exit 1
fi

STAGING_DB_URL="$1"

echo "📊 Using staging database: $STAGING_DB_URL"

# Set environment variables for staging operations
export DATABASE_URL="$STAGING_DB_URL"
export DATABASE_PUBLIC_URL="$STAGING_DB_URL"

echo "🔄 Running migrations..."
npx prisma migrate deploy

echo "🔧 Fixing enum values in database..."
# Create a temporary script to fix enum values without deleting users
cat > temp-fix-enums.js << 'EOF'
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixEnums() {
  try {
    console.log('🔧 Fixing enum values...');
    
    // Update any old enum values to valid ones
    await prisma.$executeRaw`
      UPDATE "Idea" 
      SET status = 'PENDING'::text::"IdeaStatus" 
      WHERE status::text IN ('APPROVED_BY_CLIENT', 'PENDING_FIRST_REVIEW', 'PENDING_FINAL_APPROVAL')
    `;
    
    await prisma.$executeRaw`
      UPDATE "ContentDraft" 
      SET status = 'DRAFT'::text::"DraftStatus" 
      WHERE status::text IN ('PENDING_FIRST_REVIEW', 'NEEDS_REVISION', 'PENDING_FINAL_APPROVAL', 'APPROVED_FOR_PUBLISHING', 'REJECTED')
    `;
    
    console.log('✅ Enum values fixed successfully!');
  } catch (error) {
    console.error('❌ Error fixing enum values:', error);
  }
}

fixEnums()
  .then(() => prisma.$disconnect())
  .catch((error) => {
    console.error('❌ Error:', error);
    prisma.$disconnect();
    process.exit(1);
  });
EOF

node temp-fix-enums.js

echo "🌱 Seeding database (preserving users)..."
# Create a temporary seed script that preserves users
cat > temp-seed-preserve-users.js << 'EOF'
const { PrismaClient, UserRole, ContentType, IdeaStatus, DraftStatus } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedPreservingUsers() {
  try {
    console.log('🌱 Seeding database (preserving users)...');
    
    // Check if we have any users
    const existingUsers = await prisma.user.findMany();
    console.log(`Found ${existingUsers.length} existing users`);
    
    let creative, client, admin;
    
    if (existingUsers.length === 0) {
      console.log('No users found, creating default users...');
      
      // Create test users only if none exist
      creative = await prisma.user.create({
        data: {
          name: 'Creative User',
          email: 'creative@savionray.com',
          role: UserRole.CREATIVE,
          password: await bcrypt.hash('password123', 10),
        },
      });
      
      client = await prisma.user.create({
        data: {
          name: 'Client User',
          email: 'client@savionray.com',
          role: UserRole.CLIENT,
          password: await bcrypt.hash('password123', 10),
        },
      });
      
      admin = await prisma.user.create({
        data: {
          name: 'Admin User',
          email: 'admin@savionray.com',
          role: UserRole.ADMIN,
          password: await bcrypt.hash('password123', 10),
        },
      });
      
      const bisera = await prisma.user.create({
        data: {
          name: 'Bisera',
          email: 'bisera@savionray.com',
          role: UserRole.ADMIN,
          password: await bcrypt.hash('SavionRay2025!', 10),
        },
      });
    } else {
      // Use existing users
      creative = existingUsers.find(u => u.role === UserRole.CREATIVE) || existingUsers[0];
      client = existingUsers.find(u => u.role === UserRole.CLIENT) || existingUsers[0];
      admin = existingUsers.find(u => u.role === UserRole.ADMIN) || existingUsers[0];
      console.log('Using existing users for seeding');
    }
    
    // Clear existing data (but keep users)
    await prisma.feedback.deleteMany();
    await prisma.contentDraft.deleteMany();
    await prisma.idea.deleteMany();
    await prisma.contentDeliveryItem.deleteMany();
    await prisma.contentDeliveryPlan.deleteMany();
    
    // Create some approved ideas ready for content creation
    const approvedIdeas = await Promise.all([
      prisma.idea.create({
        data: {
          title: 'Summer Marketing Campaign',
          description: 'Create engaging social media content highlighting our summer products and special offers. Focus on outdoor activities and seasonal trends.',
          status: IdeaStatus.APPROVED,
          contentType: ContentType.SOCIAL_MEDIA_POST,
          publishingDateTime: new Date('2024-07-01'),
          createdById: creative.id,
        },
      }),
      prisma.idea.create({
        data: {
          title: 'Industry Insights Newsletter',
          description: 'Monthly newsletter covering the latest trends in digital marketing, featuring expert interviews and case studies.',
          status: IdeaStatus.APPROVED,
          contentType: ContentType.NEWSLETTER,
          publishingDateTime: new Date('2024-07-15'),
          createdById: creative.id,
        },
      }),
      prisma.idea.create({
        data: {
          title: 'Product Launch Blog Series',
          description: 'A series of blog posts introducing our new product line, including features, benefits, and customer success stories.',
          status: IdeaStatus.APPROVED,
          contentType: ContentType.BLOG_POST,
          publishingDateTime: new Date('2024-07-10'),
          createdById: creative.id,
        },
      }),
    ]);
    
    // Create content drafts for approved ideas
    await Promise.all([
      prisma.contentDraft.create({
        data: {
          body: '🌞 Summer is here! Discover our amazing summer collection with exclusive offers that will make your season unforgettable. From beach essentials to outdoor adventures, we\'ve got everything you need to make the most of the sunshine! ☀️ #SummerVibes #SavionRay #SummerCollection',
          status: DraftStatus.AWAITING_FEEDBACK,
          contentType: ContentType.SOCIAL_MEDIA_POST,
          createdById: creative.id,
          ideaId: approvedIdeas[0].id,
          metadata: {
            platform: 'Instagram',
            hashtags: ['#SummerVibes', '#SavionRay', '#SummerCollection'],
            targetAudience: 'Young professionals, 25-40',
          },
        },
      }),
      prisma.contentDraft.create({
        data: {
          body: `# Industry Insights Newsletter - July 2024

## This Month's Highlights

### Digital Marketing Trends
The landscape of digital marketing continues to evolve rapidly. This month, we're seeing a significant shift towards AI-powered personalization and voice search optimization.

### Expert Interview: Sarah Johnson
We sat down with Sarah Johnson, a leading digital marketing strategist, to discuss the future of content marketing in an AI-driven world.

### Case Study: E-commerce Success Story
Learn how Company XYZ increased their conversion rate by 150% using our innovative marketing strategies.

Stay tuned for more insights next month!`,
          status: DraftStatus.AWAITING_FEEDBACK,
          contentType: ContentType.NEWSLETTER,
          createdById: creative.id,
          ideaId: approvedIdeas[1].id,
          metadata: {
            subject: 'Industry Insights Newsletter - July 2024',
            targetAudience: 'Marketing professionals',
            estimatedReadTime: '5 minutes',
          },
        },
      }),
      prisma.contentDraft.create({
        data: {
          body: `# Introducing Our Revolutionary Product Line

We're excited to announce the launch of our latest product line that's set to transform the industry. After months of research and development, we've created something truly special.

## What Makes It Different?

Our new products feature cutting-edge technology that addresses the most pressing challenges faced by our customers today. From enhanced performance to improved user experience, every detail has been carefully crafted.

## Customer Success Stories

Hear from early adopters who have already experienced the benefits of our new product line. Their stories demonstrate the real-world impact of our innovations.

Stay tuned for more details and exclusive launch offers!`,
          status: DraftStatus.AWAITING_FEEDBACK,
          contentType: ContentType.BLOG_POST,
          createdById: creative.id,
          ideaId: approvedIdeas[2].id,
          metadata: {
            seoTitle: 'Revolutionary Product Line Launch - Transform Your Business',
            keywords: ['product launch', 'innovation', 'business transformation'],
            estimatedReadTime: '8 minutes',
          },
        },
      }),
    ]);
    
    console.log('✅ Database seeded successfully (users preserved)!');
    console.log(`📋 Found ${existingUsers.length} existing users`);
    console.log('🎯 Content Review page should now show content drafts for approved ideas!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

seedPreservingUsers()
  .then(() => prisma.$disconnect())
  .catch((error) => {
    console.error('❌ Error:', error);
    prisma.$disconnect();
    process.exit(1);
  });
EOF

node temp-seed-preserve-users.js

# Clean up temporary files
rm -f temp-fix-enums.js temp-seed-preserve-users.js

echo "✅ Staging database setup completed (users preserved)!"
echo ""
echo "🎯 Content Review page should now show content drafts for approved ideas!"
echo "🎯 Next steps:"
echo "1. Update Railway staging environment variables:"
echo "   - NEXTAUTH_URL=https://your-staging-domain.railway.app"
echo "   - NEXTAUTH_SECRET=your-staging-secret"
echo "2. Deploy to staging"
echo "3. Test the Content Review page" 