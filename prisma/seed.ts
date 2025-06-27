import { PrismaClient, UserRole, ContentType, IdeaStatus, DraftStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Delete all existing data
  await prisma.feedback.deleteMany()
  await prisma.contentDraft.deleteMany()
  await prisma.idea.deleteMany()
  await prisma.contentDeliveryItem.deleteMany()
  await prisma.contentDeliveryPlan.deleteMany()
  await prisma.user.deleteMany()

  // Create test users
  const creative = await prisma.user.create({
    data: {
      name: 'Creative User',
      email: 'creative@savionray.com',
      role: UserRole.CREATIVE,
      password: await bcrypt.hash('password123', 10),
    },
  })

  const client = await prisma.user.create({
    data: {
      name: 'Client User',
      email: 'client@savionray.com',
      role: UserRole.CLIENT,
      password: await bcrypt.hash('password123', 10),
    },
  })

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@savionray.com',
      role: UserRole.ADMIN,
      password: await bcrypt.hash('password123', 10),
    },
  })

  const bisera = await prisma.user.create({
    data: {
      name: 'Bisera',
      email: 'bisera@savionray.com',
      role: UserRole.ADMIN,
      password: await bcrypt.hash('SavionRay2025!', 10),
    },
  })

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
  ])

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
  ])

  // Create a test content delivery plan
  const deliveryPlan = await prisma.contentDeliveryPlan.create({
    data: {
      name: 'Q3 2024 Content Plan',
      description: 'Content delivery plan for Q3 2024',
      startDate: new Date('2024-07-01'),
      endDate: new Date('2024-09-30'),
      targetMonth: new Date('2024-07-01'), // First month of the quarter
      clientId: client.id,
      items: {
        create: [
          {
            contentType: ContentType.BLOG_POST,
            quantity: 4,
            dueDate: new Date('2024-07-15'),
            priority: 1,
            notes: 'Monthly blog posts for July',
            ideas: {
              create: [
                {
                  title: 'Summer Marketing Trends',
                  description: 'A comprehensive guide to summer marketing strategies',
                  status: IdeaStatus.PENDING,
                  createdById: creative.id,
                  contentType: ContentType.BLOG_POST,
                },
              ],
            },
          },
          {
            contentType: ContentType.SOCIAL_MEDIA_POST,
            quantity: 12,
            dueDate: new Date('2024-07-10'),
            priority: 2,
            notes: 'Social media content for July',
            ideas: {
              create: [
                {
                  title: 'Instagram Summer Campaign',
                  description: 'Series of Instagram posts highlighting summer products',
                  status: IdeaStatus.PENDING,
                  createdById: creative.id,
                  contentType: ContentType.SOCIAL_MEDIA_POST,
                },
              ],
            },
          },
          {
            contentType: ContentType.NEWSLETTER,
            quantity: 2,
            dueDate: new Date('2024-07-20'),
            priority: 3,
            notes: 'Bi-weekly newsletters for July',
            ideas: {
              create: [
                {
                  title: 'July Newsletter: Summer Edition',
                  description: 'Mid-summer newsletter featuring seasonal content',
                  status: IdeaStatus.PENDING,
                  createdById: creative.id,
                  contentType: ContentType.NEWSLETTER,
                },
              ],
            },
          },
        ],
      },
    },
  })

  console.log('Database seeded successfully!')
  console.log('Test users created:')
  console.log('- Creative: creative@savionray.com / password123')
  console.log('- Client: client@savionray.com / password123')
  console.log('- Admin: admin@savionray.com / password123')
  console.log('- Bisera: bisera@savionray.com / SavionRay2025!')
  console.log('')
  console.log('✅ Content Review page should now show content drafts for approved ideas!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 