import { PrismaClient, UserRole, ContentType, IdeaStatus } from '@prisma/client'
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
    },
  })

  const client = await prisma.user.create({
    data: {
      name: 'Client User',
      email: 'client@savionray.com',
      role: UserRole.CLIENT,
    },
  })

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@savionray.com',
      role: UserRole.ADMIN,
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
        status: IdeaStatus.APPROVED_BY_CLIENT,
        contentType: ContentType.SOCIAL_MEDIA_POST,
        publishingDateTime: new Date('2024-07-01'),
        createdById: creative.id,
      },
    }),
    prisma.idea.create({
      data: {
        title: 'Industry Insights Newsletter',
        description: 'Monthly newsletter covering the latest trends in digital marketing, featuring expert interviews and case studies.',
        status: IdeaStatus.APPROVED_BY_CLIENT,
        contentType: ContentType.NEWSLETTER,
        publishingDateTime: new Date('2024-07-15'),
        createdById: creative.id,
      },
    }),
    prisma.idea.create({
      data: {
        title: 'Product Launch Blog Series',
        description: 'A series of blog posts introducing our new product line, including features, benefits, and customer success stories.',
        status: IdeaStatus.APPROVED_BY_CLIENT,
        contentType: ContentType.BLOG_POST,
        publishingDateTime: new Date('2024-07-10'),
        createdById: creative.id,
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
                  status: IdeaStatus.PENDING_CLIENT_APPROVAL,
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
                  status: IdeaStatus.PENDING_CLIENT_APPROVAL,
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
                  status: IdeaStatus.PENDING_CLIENT_APPROVAL,
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

  console.log('Database seeded!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 