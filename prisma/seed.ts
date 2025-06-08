import { PrismaClient, UserRole } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create test users
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@savionray.com' },
    update: {
      name: 'Admin User',
      role: UserRole.ADMIN,
    },
    create: {
      email: 'admin@savionray.com',
      name: 'Admin User',
      role: UserRole.ADMIN,
    },
  })

  const creativeUser = await prisma.user.upsert({
    where: { email: 'creative@savionray.com' },
    update: {
      name: 'Creative User',
      role: UserRole.CREATIVE,
    },
    create: {
      email: 'creative@savionray.com',
      name: 'Creative User',
      role: UserRole.CREATIVE,
    },
  })

  const clientUser = await prisma.user.upsert({
    where: { email: 'client@savionray.com' },
    update: {
      name: 'Client User',
      role: UserRole.CLIENT,
    },
    create: {
      email: 'client@savionray.com',
      name: 'Client User',
      role: UserRole.CLIENT,
    },
  })

  // Create a test idea
  const idea = await prisma.idea.create({
    data: {
      title: 'Sample Content Idea',
      description: 'This is a test content idea for the SavionRay Content Lab.',
      createdById: creativeUser.id,
    },
  })

  // Create a test content draft
  const contentDraft = await prisma.contentDraft.create({
    data: {
      body: '# Sample Content\n\nThis is a test content draft with some markdown formatting.\n\n## Key Points\n- Point 1\n- Point 2\n- Point 3',
      ideaId: idea.id,
      createdById: creativeUser.id,
    },
  })

  // Create test feedback
  await prisma.feedback.create({
    data: {
      comment: 'This looks great! Just need to add more details to the second point.',
      contentDraftId: contentDraft.id,
      createdById: clientUser.id,
    },
  })

  console.log('Seed data created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 